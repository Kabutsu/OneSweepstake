import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  console.log("Callback URL:", requestUrl.href);

  if (error) {
    console.error("Auth error:", error, errorDescription);
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/auth-code-error?error=${error}&description=${encodeURIComponent(errorDescription || "")}`
    );
  }

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Cookie setting can fail in server components
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch (error) {
              // Cookie removal can fail in server components
            }
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      console.log("✓ Successfully exchanged code for session");
      return NextResponse.redirect(`${requestUrl.origin}/`);
    }

    console.error("✗ Code exchange failed:", exchangeError.message);
  }

  // Redirect to home anyway - session might exist from cookies
  return NextResponse.redirect(`${requestUrl.origin}/`);
}
