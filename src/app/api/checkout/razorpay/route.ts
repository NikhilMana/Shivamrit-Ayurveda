import { NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, notes = {} } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const { razorpay, key_id } = getRazorpayClient();

    // Clean notes payload for Razorpay (Razorpay allows up to 15 key-value string pairs)
    const formattedNotes: { [key: string]: string } = {};
    if (notes.user_id) formattedNotes.user_id = String(notes.user_id);
    if (notes.address_id) formattedNotes.address_id = String(notes.address_id);
    if (notes.user_email) formattedNotes.user_email = String(notes.user_email);
    if (notes.user_phone) formattedNotes.user_phone = String(notes.user_phone);
    if (notes.items) formattedNotes.items = typeof notes.items === "string" ? notes.items : JSON.stringify(notes.items);

    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: formattedNotes,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ order, key_id });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
