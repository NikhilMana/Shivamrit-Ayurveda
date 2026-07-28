const { Client } = require("pg");

const connectionString = "postgresql://postgres.jmgluhfmvjphxbptnkeo:Shivamrit%4020@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log("Connected to Supabase PostgreSQL.");

  try {
    const email = "admin@shivamritayurveda.com";
    const password = "ShivamritAdmin#2026";

    // Update password hash and email confirmation timestamp
    const res = await client.query(`
      UPDATE auth.users 
      SET 
        encrypted_password = crypt($2, gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW()
      WHERE email = $1
      RETURNING id, email;
    `, [email, password]);

    if (res.rows.length > 0) {
      console.log(`✅ Password updated successfully for ${res.rows[0].email} (${res.rows[0].id})`);
      
      // Ensure profile role is 'admin'
      await client.query(`
        INSERT INTO public.profiles (id, full_name, role)
        VALUES ($1, 'Shivamrit Admin', 'admin')
        ON CONFLICT (id) DO UPDATE SET role = 'admin';
      `, [res.rows[0].id]);
      
      console.log(`✅ Verified admin role in public.profiles.`);
    } else {
      console.log(`User ${email} not found.`);
    }

  } catch (err) {
    console.error("Error resetting password:", err);
  } finally {
    await client.end();
  }
}

main();
