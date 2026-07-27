import Razorpay from "razorpay";
import crypto from "crypto";

export function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_mockkeyid123";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "mockkeysecret123456789";

  return new Razorpay({
    key_id,
    key_secret,
  });
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET || "mockkeysecret123456789";
  const body = `${orderId}|${paymentId}`;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === signature;
}
