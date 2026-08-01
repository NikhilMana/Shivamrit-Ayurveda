import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify Admin Role
    const { data: profile } = await (supabase
      .from("profiles") as any)
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { payment_id, target_email } = body;

    if (!payment_id) {
      return NextResponse.json({ error: "Payment ID (e.g. pay_TKazDbLVjC3Aj8) is required" }, { status: 400 });
    }

    const cleanPaymentId = payment_id.trim();

    // Fetch live payment details from Razorpay API
    const { razorpay } = getRazorpayClient();
    let payment: any;
    try {
      payment = await razorpay.payments.fetch(cleanPaymentId);
    } catch (err: any) {
      console.error("Error fetching payment from Razorpay:", err);
      return NextResponse.json(
        { error: `Razorpay payment not found: ${err.message || "Invalid Payment ID"}` },
        { status: 404 }
      );
    }

    if (payment.status !== "captured" && payment.status !== "authorized") {
      return NextResponse.json(
        { error: `Payment status is '${payment.status}'. Only captured/authorized payments can be recovered.` },
        { status: 400 }
      );
    }

    const razorpay_order_id = payment.order_id || null;
    const amount = payment.amount ? payment.amount / 100 : 0;
    const notes = payment.notes || {};

    // Check if order already exists in Supabase
    const { data: existingOrders } = await (supabase
      .from("orders") as any)
      .select("*, profiles(full_name, email)")
      .or(`razorpay_payment_id.eq.${cleanPaymentId}${razorpay_order_id ? `,razorpay_order_id.eq.${razorpay_order_id}` : ""}`);

    if (existingOrders && existingOrders.length > 0) {
      const existingOrder = existingOrders[0];
      if (existingOrder.payment_status !== "paid") {
        await (supabase.from("orders") as any)
          .update({
            payment_status: "paid",
            order_status: "confirmed",
            razorpay_payment_id: cleanPaymentId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingOrder.id);
      }

      return NextResponse.json({
        success: true,
        recovered: false,
        order: existingOrder,
        message: `Order #${existingOrder.id.slice(0, 8).toUpperCase()} already exists and is marked as Paid.`,
      });
    }

    // Resolve target customer user_id
    let customerUserId: string | null = notes.user_id || null;
    let customerEmail: string = target_email || notes.user_email || payment.email || "";
    let customerPhone: string = notes.user_phone || payment.contact || "";

    // If customerUserId is missing, search profiles by email or phone
    if (!customerUserId && customerEmail) {
      const { data: foundProfile } = await (supabase
        .from("profiles") as any)
        .select("id, full_name, email, phone")
        .ilike("email", customerEmail.trim())
        .maybeSingle();

      if (foundProfile) {
        customerUserId = foundProfile.id;
      }
    }

    if (!customerUserId && customerPhone) {
      const cleanPhone = customerPhone.replace(/\D/g, "").slice(-10);
      const { data: foundProfile } = await (supabase
        .from("profiles") as any)
        .select("id, full_name, email, phone")
        .ilike("phone", `%${cleanPhone}%`)
        .maybeSingle();

      if (foundProfile) {
        customerUserId = foundProfile.id;
        if (!customerEmail && foundProfile.email) customerEmail = foundProfile.email;
      }
    }

    // Fall back to current admin or first matching profile if still unassigned
    if (!customerUserId) {
      customerUserId = user.id;
    }

    // Parse items from notes or fallback default item
    let items: any[] = [];
    if (notes.items) {
      try {
        items = typeof notes.items === "string" ? JSON.parse(notes.items) : notes.items;
      } catch (e) {
        console.error("Error parsing items from notes:", e);
      }
    }

    const addressId = notes.address_id || null;

    // Create the missing order in Supabase
    const { data: newOrder, error: orderError } = await (supabase
      .from("orders") as any)
      .insert({
        user_id: customerUserId,
        address_id: addressId,
        subtotal: amount,
        shipping_charge: 0,
        total_amount: amount,
        payment_method: "razorpay",
        payment_status: "paid",
        order_status: "confirmed",
        razorpay_order_id,
        razorpay_payment_id: cleanPaymentId,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert Order Items
    if (items.length > 0) {
      const orderItemsPayload = items.map((item: any) => ({
        order_id: newOrder.id,
        product_id: item.product_id || item.id,
        quantity: item.quantity || 1,
        price: item.price || amount,
      }));
      await (supabase.from("order_items") as any).insert(orderItemsPayload);
    } else {
      // Default order item
      await (supabase.from("order_items") as any).insert({
        order_id: newOrder.id,
        product_id: null,
        quantity: 1,
        price: amount,
      });
    }

    // Insert Payment Record
    await (supabase.from("payments") as any).insert({
      order_id: newOrder.id,
      provider: "razorpay",
      transaction_id: cleanPaymentId,
      amount,
      status: "paid",
      paid_at: new Date().toISOString(),
    });

    // Send Confirmation Email to Customer
    if (customerEmail) {
      const { data: customerProfile } = await (supabase
        .from("profiles") as any)
        .select("full_name")
        .eq("id", customerUserId)
        .single();

      await sendOrderConfirmationEmail(
        customerEmail,
        customerProfile?.full_name || "Valued Customer",
        newOrder.id,
        amount,
        `Order recovered from payment #${cleanPaymentId}`
      );
    }

    return NextResponse.json({
      success: true,
      recovered: true,
      order: newOrder,
      message: `Payment #${cleanPaymentId} successfully recovered! Created Order #${newOrder.id.slice(0, 8).toUpperCase()}.`,
    });
  } catch (error: any) {
    console.error("Admin payment recovery error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to recover payment" },
      { status: 500 }
    );
  }
}
