import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendCancellationRequestedEmail } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, reason } = body;

    if (!order_id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Fetch order
    const { data: order, error: fetchError } = await (supabase
      .from("orders") as any)
      .select("*")
      .eq("id", order_id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (["shipped", "delivered", "cancelled"].includes(order.order_status)) {
      return NextResponse.json(
        { error: `Orders with status '${order.order_status}' cannot be cancelled.` },
        { status: 400 }
      );
    }

    if (order.order_status === "cancellation_requested") {
      return NextResponse.json(
        { error: "Cancellation has already been requested for this order." },
        { status: 400 }
      );
    }

    // Helper to safely update order with fallback if cancel_reason column cache is reloading
    const safeUpdate = async (newOrderStatus: string, defaultReason: string) => {
      let { error: updateError } = await (supabase
        .from("orders") as any)
        .update({
          order_status: newOrderStatus,
          cancel_reason: reason || defaultReason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      // Fallback if cancel_reason column is transiently missing in PostgREST schema cache
      if (updateError && updateError.message?.includes("cancel_reason")) {
        console.warn("PostgREST schema cache fallback: updating order_status without cancel_reason");
        const { error: fallbackError } = await (supabase
          .from("orders") as any)
          .update({
            order_status: newOrderStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);
        updateError = fallbackError;
      }

      if (updateError) throw updateError;
    };

    // If order is COD or Unpaid: Cancel immediately
    if (order.payment_method === "cod" || order.payment_status !== "paid") {
      await safeUpdate("cancelled", "Cancelled by customer");

      return NextResponse.json({
        success: true,
        status: "cancelled",
        message: "Order cancelled successfully.",
      });
    }

    // If order is Paid (e.g. via Razorpay): Request Cancellation for Admin Approval & Refund
    await safeUpdate("cancellation_requested", "Cancellation & refund requested by customer");

    // Fetch customer profile for email
    const { data: profile } = await (supabase
      .from("profiles") as any)
      .select("full_name")
      .eq("id", user.id)
      .single();

    await sendCancellationRequestedEmail(
      user.email || "",
      profile?.full_name || "Valued Customer",
      order.id,
      order.total_amount
    );

    return NextResponse.json({
      success: true,
      status: "cancellation_requested",
      message: "Cancellation request submitted. Pending admin approval and refund.",
    });
  } catch (error: any) {
    console.error("Order cancellation request error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process cancellation request" },
      { status: 500 }
    );
  }
}
