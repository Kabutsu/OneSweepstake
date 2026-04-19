import { NextRequest, NextResponse } from "next/server";
import { getAndClearRedirectCookie } from "@/lib/auth/cookies";

/**
 * Check if a redirect path is valid and safe
 */
function isValidRedirectPath(path: string | null): boolean {
  if (!path) return false;
  
  // Must start with /
  if (!path.startsWith('/')) return false;
  
  // Block external URLs
  if (path.startsWith('//')) return false;
  
  // Block auth pages (no point redirecting back to auth)
  if (path.startsWith('/auth/')) return false;
  
  // Block internal browser/dev paths
  if (path.includes('.well-known')) return false;
  if (path.includes('devtools')) return false;
  
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const destination = await getAndClearRedirectCookie();
    
    // Validate and sanitize destination
    const finalDestination = isValidRedirectPath(destination) ? destination : "/";
    
    return NextResponse.json({
      destination: finalDestination,
    });
  } catch (error) {
    console.error("Get redirect error:", error);
    return NextResponse.json({ destination: "/" });
  }
}
