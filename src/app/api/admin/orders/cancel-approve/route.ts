import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";
import { sendRefundConfirmationEmail } from "@/lib/resend";

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
    const { order_id, action = "approve" } = body;

    if (!order_id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Fetch order details with profile email
    const { data: order, error: orderError } = await (supabase
      .from("orders") as any)
      .select("*, profiles(full_name)")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (action === "reject") {
      const { error: updateError } = await (supabase
        .from("orders") as any)
        .update({
          order_status: "confirmed",
          cancel_reason: "Cancellation request rejected by admin",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        message: "Cancellation request rejected. Order restored to Confirmed.",
      });
    }

    // Action === "approve"
    let refundId: string | undefined = undefined;

    // Process Razorpay refund if paid online
    if (order.payment_method === "razorpay" && order.payment_status === "paid" && order.razorpay_payment_id) {
      try {
        const { razorpay } = getRazorpayClient();
        const refund = await razorpay.payments.refund(order.razorpay_payment_id, {
          amount: Math.round(order.total_amount * 100),
          notes: {
            reason: order.cancel_reason || "Admin approved cancellation",
            order_id: order.id,
          },
        });
        refundId = refund.id;
      } catch (refundError: any) {
        console.error("Razorpay API refund error:", refundError);
        return NextResponse.json(
          { error: `Razorpay refund failed: ${refundError.message || "Unknown error"}` },
          { status: 500 }
        );
      }
    }

    // Update Supabase order status
    const newPaymentStatus = order.payment_status === "paid" ? "refunded" : order.payment_status;
    const { error: updateError } = await (supabase
      .from("orders") as any)
      .update({
        order_status: "cancelled",
        payment_status: newPaymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) throw updateError;

    // Record in payments table
    if (order.payment_status === "paid") {
      await (supabase.from("payments") as any).insert({
        order_id: order.id,
        provider: "razorpay",
        transaction_id: refundId || order.razorpay_payment_id,
        amount: order.total_amount,
        status: "refunded",
        paid_at: new Date().toISOString(),
      });
    }

    // Fetch user email via auth or profile
    const { data: userData } = await supabase.auth.admin.getUserById(order.user_id).catch(() => ({ data: { user: null } }));
    const customerEmail = userData?.user?.email || "";

    if (customerEmail) {
      await sendRefundConfirmationEmail(
        customerEmail,
        order.profiles?.full_name || "Valued Customer",
        order.id,
        order.total_amount,
        refundId
      );
    }

    return NextResponse.json({
      success: true,
      refund_id: refundId,
      message: refundId
        ? `Cancellation approved & Razorpay refund #${refundId} initiated successfully.`
        : "Order cancellation approved successfully.",
    });
  } catch (error: any) {
    console.error("Admin approve cancellation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve cancellation request" },
      { status: 500 }
    );
  }
}
