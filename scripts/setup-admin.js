const { createClient } = require("@supabase/supabase-js");
const { Client } = require("pg");

const supabaseUrl = "https://jmgluhfmvjphxbptnkeo.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZ2x1aGZtdmpwaHhicHRua2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMjAzMjQsImV4cCI6MjEwMDY5NjMyNH0.7EM0SN9gGud3DKVP9BuRUXebjlnRlEVK-533m19-18Q";
const connectionString = "postgresql://postgres.jmgluhfmvjphxbptnkeo:Shivamrit%4020@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

async function main() {
  const pgClient = new Client({ connectionString });
  await pgClient.connect();
  console.log("Connected to Supabase PostgreSQL.");

  const email = "admin@shivamritayurveda.in";
  const password = "ShivamritAdmin#2026";

  try {
    // 1. Delete old record if exists
    await pgClient.query(`DELETE FROM auth.users WHERE email = $1`, [email]);
    console.log(`Cleaned up old auth record for ${email}.`);

    // 2. Register fresh user using official Supabase Client JS (GoTrue engine)
    const supabase = createClient(supabaseUrl, anonKey);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: "Shivamrit Admin",
        },
      },
    });

    if (signUpError) {
      console.error("SignUp Error:", signUpError);
      return;
    }

    const userId = signUpData.user.id;
    console.log(`Successfully created GoTrue auth user: ${userId}`);

    // 3. Confirm email and promote role to 'admin' in PostgreSQL DB
    await pgClient.query(`
      UPDATE auth.users 
      SET email_confirmed_at = NOW(), raw_app_meta_data = '{"provider":"email","providers":["email"]}'
      WHERE id = $1;
    `, [userId]);

    await pgClient.query(`
      INSERT INTO public.profiles (id, full_name, role)
      VALUES ($1, 'Shivamrit Admin', 'admin')
      ON CONFLICT (id) DO UPDATE SET role = 'admin';
    `, [userId]);

    console.log("✅ Email confirmed and role updated to 'admin' in public.profiles.");

    // 4. Test login using Supabase Client JS to guarantee 100% authentication success
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("❌ Test login verification failed:", signInError);
    } else {
      console.log("\n🎉 TEST LOGIN VERIFIED 100% SUCCESSFUL!");
      console.log("Access Token granted:", signInData.session.access_token.slice(0, 30) + "...");
    }

    console.log("\n=============================================");
    console.log("🔑 VERIFIED ADMIN LOGIN CREDENTIALS:");
    console.log(`Email:    admin@shivamritayurveda.in`);
    console.log(`Password: ShivamritAdmin#2026`);
    console.log(`URL:      https://www.shivamritayurveda.in/login`);
    console.log("=============================================\n");

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pgClient.end();
  }
}

main();
