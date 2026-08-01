const Razorpay = require("razorpay");
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

function getEnvVars() {
  const envPath = path.join(__dirname, "../.env.local");
  const env = {};
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    content.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([\w_]+)\s*=\s*["']?([^"'\r\n]+)["']?/);
      if (match) env[match[1]] = match[2];
    });
  }
  return env;
}

async function recover() {
  const env = getEnvVars();

  const key_id = env.RAZORPAY_KEY_ID || env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TIRna8aLkJDtL0";
  const key_secret = env.RAZORPAY_KEY_SECRET || "mockkeysecret123456789";
  const connectionString = env.DATABASE_DIRECT_URL || env.DATABASE_URL;

  console.log(`Using Razorpay Key ID: ${key_id}`);
  const razorpay = new Razorpay({ key_id, key_secret });

  console.log("Connecting to Supabase Database...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to Supabase DB successfully!");

    // Fetch payments from Razorpay
    const paymentsRes = await razorpay.payments.all({ count: 100 });
    const payments = paymentsRes.items || [];
    console.log(`Fetched ${payments.length} payment records from Razorpay.`);

    for (const payment of payments) {
      if (payment.status !== "captured" && payment.status !== "authorized") {
        continue;
      }

      console.log(`Processing payment ${payment.id} (₹${payment.amount / 100}, email: ${payment.email}, contact: ${payment.contact})...`);

      // Check if order already exists in DB
      const existing = await client.query(
        "SELECT id FROM public.orders WHERE razorpay_payment_id = $1 OR razorpay_order_id = $2",
        [payment.id, payment.order_id]
      );

      if (existing.rows.length > 0) {
        console.log(`Order for payment ${payment.id} already exists in DB.`);
        continue;
      }

      // Resolve user_id from profiles or auth.users
      let userId = payment.notes?.user_id;

      if (!userId && payment.email) {
        const userRes = await client.query(
          "SELECT id FROM public.profiles WHERE LOWER(email) = LOWER($1) UNION SELECT id FROM auth.users WHERE LOWER(email) = LOWER($1) LIMIT 1",
          [payment.email]
        );
        if (userRes.rows.length > 0) userId = userRes.rows[0].id;
      }

      if (!userId && payment.contact) {
        const cleanPhone = payment.contact.replace(/\D/g, "").slice(-10);
        const userRes = await client.query(
          "SELECT id FROM public.profiles WHERE phone LIKE $1 LIMIT 1",
          [`%${cleanPhone}%`]
        );
        if (userRes.rows.length > 0) userId = userRes.rows[0].id;
      }

      if (!userId) {
        // Assign to first profile if available
        const fallbackRes = await client.query("SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1");
        if (fallbackRes.rows.length > 0) userId = fallbackRes.rows[0].id;
      }

      if (!userId) {
        console.warn(`Could not resolve user_id for payment ${payment.id}, skipping.`);
        continue;
      }

      const amount = payment.amount / 100;

      // Insert into orders table
      const orderRes = await client.query(
        `INSERT INTO public.orders (user_id, subtotal, shipping_charge, total_amount, payment_method, payment_status, order_status, razorpay_order_id, razorpay_payment_id)
         VALUES ($1, $2, 0, $2, 'razorpay', 'paid', 'confirmed', $3, $4)
         RETURNING id`,
        [userId, amount, payment.order_id, payment.id]
      );

      const orderId = orderRes.rows[0].id;
      console.log(`Created order ${orderId} for payment ${payment.id}`);

      // Insert default order item
      await client.query(
        `INSERT INTO public.order_items (order_id, quantity, price) VALUES ($1, 1, $2)`,
        [orderId, amount]
      );

      // Insert payment record
      await client.query(
        `INSERT INTO public.payments (order_id, provider, transaction_id, amount, status, paid_at)
         VALUES ($1, 'razorpay', $2, $3, 'paid', NOW())`,
        [orderId, payment.id, amount]
      );
    }

    console.log("All Razorpay payments sync completed!");
  } catch (err) {
    console.error("Recovery error:", err);
  } finally {
    await client.end();
  }
}

recover();
