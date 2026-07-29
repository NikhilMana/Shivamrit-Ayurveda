import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || "Shivamrit Ayurveda <orders@shivamritayurveda.in>";

export async function sendWelcomeEmail(toEmail: string, fullName: string) {
  if (!resend) {
    console.log(`[Resend Mock] Welcome email queued for ${toEmail} (${fullName})`);
    return { success: true, mock: true };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: "Welcome to Shivamrit Ayurveda Sanctuary",
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #FFF8F4; color: #3A2B28; border: 1px solid #EADBCE; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #C89B3C;">
            <h1 style="font-family: Georgia, serif; font-size: 26px; color: #C89B3C; margin: 0; letter-spacing: 2px;">SHIVAMRIT AYURVEDA</h1>
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #6D5A56; margin-top: 4px;">Sacred Botanical Care</p>
          </div>
          
          <h2 style="font-family: Georgia, serif; color: #3A2B28; font-size: 20px;">Welcome to our Sanctuary, ${fullName}!</h2>
          <p style="line-height: 1.6; color: #6D5A56; font-size: 14px;">
            We are deeply honored to welcome you to our community. At Shivamrit Ayurveda, every formulation is handcrafted with pure cold-pressed herbs, authentic saffron, and time-tested Ayurvedic wisdom.
          </p>
          
          <div style="background-color: #F7EEE7; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid rgba(200, 155, 60, 0.2);">
            <h3 style="font-family: Georgia, serif; margin-top: 0; color: #C89B3C; font-size: 16px;">What Awaits You:</h3>
            <ul style="padding-left: 20px; margin: 0; color: #6D5A56; font-size: 13px; line-height: 1.8;">
              <li>100% Pure Botanical Formulations (Paraben & Sulphate Free)</li>
              <li>Hand-carved Pure Neem Wood Combs for Healthy Scalp Circulation</li>
              <li>Free Express Delivery across India (5-7 Business Days)</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://www.shivamritayurveda.in/products" style="background-color: #C89B3C; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block;">Explore Formulations</a>
          </div>

          <hr style="border: none; border-top: 1px solid #EADBCE; margin: 30px 0 15px 0;" />
          <p style="font-size: 11px; color: #6D5A56; text-align: center; margin: 0;">
            Need Assistance? Contact Dr. Shashank Mana (+91 8123403829) or Dr. Prashant Mali (+91 9353912943)
          </p>
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
      from: fromEmail,
      to: [toEmail],
      subject: `Order Confirmed #${orderId.slice(0, 8).toUpperCase()} - Shivamrit Ayurveda`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #FFF8F4; color: #3A2B28; border: 1px solid #EADBCE; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #C89B3C;">
            <h1 style="font-family: Georgia, serif; font-size: 26px; color: #C89B3C; margin: 0; letter-spacing: 2px;">SHIVAMRIT AYURVEDA</h1>
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #6D5A56; margin-top: 4px;">Order Confirmation</p>
          </div>
          
          <h2 style="font-family: Georgia, serif; color: #3A2B28; font-size: 20px;">Thank you for your order, ${fullName}!</h2>
          <p style="line-height: 1.6; color: #6D5A56; font-size: 14px;">
            Your order <strong>#${orderId.slice(0, 8).toUpperCase()}</strong> has been successfully received and is currently being prepared at our sanctuary.
          </p>
          
          <div style="background-color: #F7EEE7; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid rgba(200, 155, 60, 0.2);">
            <h3 style="font-family: Georgia, serif; margin-top: 0; color: #C89B3C; font-size: 15px; text-transform: uppercase; letter-spacing: 1px;">Order Summary</h3>
            <p style="font-size: 14px; color: #3A2B28; margin-bottom: 10px;">${itemsSummary}</p>
            <div style="border-top: 1px border-[#EADBCE]; padding-top: 10px; margin-top: 10px; display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #C89B3C;">
              <span>Total Paid / Amount Due:</span>
              <span>₹${totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div style="background-color: #ffffff; padding: 15px; border-radius: 10px; border: 1px solid #EADBCE; margin-bottom: 25px;">
            <p style="font-size: 12px; color: #6D5A56; margin: 0;">
              📦 <strong>Estimated Delivery:</strong> 5-7 Business Days across India. You will receive a shipment tracking code as soon as your order is dispatched via our delivery partner.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #EADBCE; margin: 25px 0 15px 0;" />
          <p style="font-size: 11px; color: #6D5A56; text-align: center; margin: 0;">
            Support Helpline: Dr. Shashank Mana (+91 8123403829) | Dr. Prashant Mali (+91 9353912943)
          </p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Resend Order Confirmation error:", error);
    return { success: false, error };
  }
}
