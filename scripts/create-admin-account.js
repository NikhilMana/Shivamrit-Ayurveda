const { Client } = require("pg");
const crypto = require("crypto");

const connectionString = "postgresql://postgres.jmgluhfmvjphxbptnkeo:Shivamrit%4020@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log("Connected to Supabase PostgreSQL.");

  try {
    const email = "admin@shivamritayurveda.com";
    const password = "ShivamritAdmin#2026";

    // 1. Check if profile exists with role = 'admin'
    const res = await client.query(
      `SELECT p.id, p.role, u.email FROM public.profiles p JOIN auth.users u ON p.id = u.id WHERE u.email = $1`,
      [email]
    );

    if (res.rows.length > 0) {
      const user = res.rows[0];
      console.log(`User ${email} already exists with ID: ${user.id}`);
      
      // Update role to admin if not already
      await client.query(
        `UPDATE public.profiles SET role = 'admin' WHERE id = $1`,
        [user.id]
      );
      console.log(`✅ Profile role updated to 'admin' for ${email}`);
    } else {
      console.log(`Creating new Admin user ${email}...`);
      
      // Use pgcrypto to generate bcrypt password hash
      const userRes = await client.query(`
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          $1,
          crypt($2, gen_salt('bf')),
          NOW(),
          '{"provider":"email","providers":["email"]}',
          '{"full_name":"Shivamrit Admin"}',
          NOW(),
          NOW()
        ) RETURNING id;
      `, [email, password]);

      const userId = userRes.rows[0].id;
      console.log(`Created auth.users record: ${userId}`);

      // Ensure profile entry exists with role = 'admin'
      await client.query(`
        INSERT INTO public.profiles (id, full_name, role)
        VALUES ($1, 'Shivamrit Admin', 'admin')
        ON CONFLICT (id) DO UPDATE SET role = 'admin';
      `, [userId]);

      console.log(`✅ Admin profile created successfully for ${email}`);
    }

    console.log("\n=============================================");
    console.log("🔑 ADMIN LOGIN CREDENTIALS:");
    console.log(`Email:    admin@shivamritayurveda.com`);
    console.log(`Password: ShivamritAdmin#2026`);
    console.log(`Dashboard URL: /admin (or /login)`);
    console.log("=============================================\n");

  } catch (err) {
    console.error("Error creating admin account:", err);
  } finally {
    await client.end();
  }
}

main();
