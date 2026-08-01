import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { sendOrderConfirmationEmail } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      process.env.RAZORPAY_KEY_SECRET ||
      "mockkeysecret123456789";

    if (signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.warn("Razorpay Webhook signature verification failed.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === "payment.captured" || event === "order.paid") {
      const payment = payload.payload?.payment?.entity;
      if (!payment) {
        return NextResponse.json({ received: true });
      }

      const razorpay_payment_id = payment.id;
      const razorpay_order_id = payment.order_id;
      const amount = payment.amount ? payment.amount / 100 : 0;
      const notes = payment.notes || {};

      // Initialize Supabase admin client using env keys
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jmgluhfmvjphxbptnkeo.supabase.co";
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Check if order already exists in Supabase
      let query = supabase.from("orders").select("id, payment_status");
      if (razorpay_payment_id) {
        query = query.or(`razorpay_payment_id.eq.${razorpay_payment_id},razorpay_order_id.eq.${razorpay_order_id}`);
      } else {
        query = query.eq("razorpay_order_id", razorpay_order_id);
      }

      const { data: existingOrders } = await query;

      if (existingOrders && existingOrders.length > 0) {
        // Order exists: ensure payment status is updated to paid
        const existingOrder = existingOrders[0];
        if (existingOrder.payment_status !== "paid") {
          await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              order_status: "confirmed",
              razorpay_payment_id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingOrder.id);
        }
        return NextResponse.json({ received: true, status: "order_updated" });
      }

      // Order does NOT exist (mobile browser session dropped before client verify)
      // Reconstruct order from Razorpay payment notes & customer credentials
      let userId = notes.user_id;
      const userEmail = notes.user_email || payment.email || "";
      const userPhone = notes.user_phone || payment.contact || "";

      // If user_id missing, attempt lookup by email in profiles
      if (!userId && userEmail) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", userEmail)
          .single();
        if (profile) userId = profile.id;
      }

      if (!userId) {
        console.warn("Razorpay Webhook: Unable to resolve user_id for captured payment", razorpay_payment_id);
        return NextResponse.json({ received: true, warning: "unresolved_user" });
      }

      const addressId = notes.address_id || null;
      let items: any[] = [];
      if (notes.items) {
        try {
          items = typeof notes.items === "string" ? JSON.parse(notes.items) : notes.items;
        } catch (e) {
          console.error("Error parsing items from Razorpay notes:", e);
        }
      }

      const subtotal = amount;
      const shippingCharge = 0;
      const totalAmount = amount;

      // Insert Order
      const { data: newOrder, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          address_id: addressId,
          subtotal,
          shipping_charge: shippingCharge,
          total_amount: totalAmount,
          payment_method: "razorpay",
          payment_status: "paid",
          order_status: "confirmed",
          razorpay_order_id,
          razorpay_payment_id,
        })
        .select()
        .single();

      if (orderError) {
        console.error("Webhook order insert error:", orderError);
        throw orderError;
      }

      // Insert Order Items if present
      if (items.length > 0) {
        const orderItemsPayload = items.map((item: any) => ({
          order_id: newOrder.id,
          product_id: item.product_id || item.id,
          quantity: item.quantity || 1,
          price: item.price || 0,
        }));
        await supabase.from("order_items").insert(orderItemsPayload);
      }

      // Insert Payment Record
      await supabase.from("payments").insert({
        order_id: newOrder.id,
        provider: "razorpay",
        transaction_id: razorpay_payment_id,
        amount: totalAmount,
        status: "paid",
        paid_at: new Date().toISOString(),
      });

      // Send Order Confirmation Email
      if (userEmail) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", userId)
          .single();

        await sendOrderConfirmationEmail(
          userEmail,
          profile?.full_name || "Valued Customer",
          newOrder.id,
          totalAmount,
          `${items.length || 1} items purchased via Razorpay`
        );
      }

      return NextResponse.json({ received: true, status: "order_created", order_id: newOrder.id });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: error.message || "Webhook handling failed" }, { status: 500 });
  }
}
