import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Production base URL fallback to prevent localhost redirects
  const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (origin && !origin.includes("localhost")) return origin;
    return process.env.NODE_ENV === "production" ? "https://www.shivamritayurveda.in" : origin;
  };

  const baseUrl = getBaseUrl();

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore inside Server Actions / Route Handlers if handled on response
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(`${baseUrl}${next}`);

      // Copy session cookies onto response header to ensure browser stores them
      cookieStore.getAll().forEach((c) => {
        response.cookies.set(c.name, c.value);
      });

      return response;
    } else {
      console.error("Supabase exchangeCodeForSession error:", error);
    }
  }

  return NextResponse.redirect(`${baseUrl}/login?error=auth-callback-failed`);
}
