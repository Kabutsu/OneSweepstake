import { createClient } from "@/lib/supabase/server";
import { clearAllAuthCookies } from "@/lib/auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  // Sign out from Supabase
  await supabase.auth.signOut();
  
  // Clear all authentication cookies
  await clearAllAuthCookies();
  
  // Redirect to auth page
  const url = request.nextUrl.clone();
  url.pathname = "/auth/enter";
  url.search = "";
  
  return NextResponse.redirect(url);
}
