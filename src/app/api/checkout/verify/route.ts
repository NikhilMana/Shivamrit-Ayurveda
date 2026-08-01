import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      address_id,
      items,
      subtotal,
      shipping_charge,
      total_amount,
    } = body;

    // Verify Signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Idempotency Check: Prevent duplicate order creation
    const { data: existingOrders } = await (supabase
      .from("orders") as any)
      .select("*")
      .or(`razorpay_payment_id.eq.${razorpay_payment_id},razorpay_order_id.eq.${razorpay_order_id}`);

    if (existingOrders && existingOrders.length > 0) {
      const existingOrder = existingOrders[0];
      return NextResponse.json({ success: true, order: existingOrder, idempotent: true });
    }

    // Insert Order
    const { data: order, error: orderError } = await (supabase
      .from("orders") as any)
      .insert({
        user_id: user.id,
        address_id,
        subtotal,
        shipping_charge,
        total_amount,
        payment_method: "razorpay",
        payment_status: "paid",
        order_status: "confirmed",
        razorpay_order_id,
        razorpay_payment_id,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert Order Items
    if (items && items.length > 0) {
      const orderItemsPayload = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id || item.id,
        quantity: item.quantity || 1,
        price: item.price || 0,
      }));

      await (supabase.from("order_items") as any).insert(orderItemsPayload);
    }

    // Insert Payment Record
    await (supabase.from("payments") as any).insert({
      order_id: order.id,
      provider: "razorpay",
      transaction_id: razorpay_payment_id,
      amount: total_amount,
      status: "paid",
      paid_at: new Date().toISOString(),
    });

    // Clear DB Cart
    await (supabase.from("cart_items") as any).delete().eq("user_id", user.id);

    // Trigger Order Confirmation Email with robust email resolution
    const { data: profile } = await (supabase
      .from("profiles") as any)
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    const customerEmail = user.email || profile?.email || "";

    if (customerEmail) {
      await sendOrderConfirmationEmail(
        customerEmail,
        profile?.full_name || "Valued Customer",
        order.id,
        total_amount,
        `${items?.length || 1} items purchased via Razorpay`
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
