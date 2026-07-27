import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendWelcomeEmail(toEmail: string, fullName: string) {
  if (!resend) {
    console.log(`[Resend Mock] Welcome email queued for ${toEmail} (${fullName})`);
    return { success: true, mock: true };
  }

  try {
    const data = await resend.emails.send({
      from: "Shivamrit Ayurveda <orders@shivamritayurveda.com>",
      to: [toEmail],
      subject: "Welcome to Shivamrit Ayurveda Sanctuary",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1a392a;">
          <h2 style="color: #1a392a;">Welcome to Shivamrit Ayurveda, ${fullName}!</h2>
          <p>We are delighted to welcome you to our sanctuary of traditional holistic care.</p>
          <p>Explore our handcrafted botanical preparations for hair care, skin care, and total wellness.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280;">Shivamrit Ayurveda, Haridwar, Uttarakhand, India</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Resend Welcome Email error:", error);
    return { success: false, error };
  }
}

export async function sendOrderConfirmationEmail(
  toEmail: string,
  fullName: string,
  orderId: string,
  totalAmount: number,
  itemsSummary: string
) {
  if (!resend) {
    console.log(
      `[Resend Mock] Order confirmation email queued for ${toEmail} (Order #${orderId}, Total ₹${totalAmount})`
    );
    return { success: true, mock: true };
  }

  try {
    const data = await resend.emails.send({
      from: "Shivamrit Ayurveda <orders@shivamritayurveda.com>",
      to: [toEmail],
      subject: `Order Confirmation #${orderId.slice(0, 8)} - Shivamrit Ayurveda`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1a392a;">
          <h2 style="color: #1a392a;">Thank you for your order, ${fullName}!</h2>
          <p>Your order <strong>#${orderId}</strong> has been received and is being prepared with utmost care.</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Order Summary:</strong></p>
            <p>${itemsSummary}</p>
            <p style="font-size: 16px; color: #166534; margin-top: 10px;"><strong>Total Paid: ₹${totalAmount}</strong></p>
          </div>
          <p>We will notify you as soon as your sanctuary package is shipped!</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Resend Order Confirmation error:", error);
    return { success: false, error };
  }
}
