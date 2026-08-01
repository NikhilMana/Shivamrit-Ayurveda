import { NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { amount, currency = "INR", receipt } = body;

    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    // Convert to paise if amount is in rupees (< 1000 and not specified as paise)
    let amountInPaise = Math.round(Number(amount));
    if (amountInPaise < 100) {
      amountInPaise = Math.round(Number(amount) * 100);
    }

    if (amountInPaise < 100) {
      return NextResponse.json(
        { error: "Minimum amount is 100 paise (₹1.00)" },
        { status: 400 }
      );
    }

    const { razorpay, key_id } = getRazorpayClient();

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id,
      order,
    });
  } catch (error: any) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
