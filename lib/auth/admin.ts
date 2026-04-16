import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Create a Supabase client with admin privileges
 * WARNING: Only use this server-side, never expose to client
 */
export function createAdminClient() {
  return createClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create a new user with the admin API
 */
export async function createSupabaseUser(email: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (error) throw error;
  return data.user;
}

/**
 * Generate a session token for a user
 */
export async function generateSessionToken(email: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error) throw error;
  
  // Extract the token from the magic link URL
  const url = new URL(data.properties.action_link);
  const token = url.searchParams.get("token");
  
  if (!token) {
    throw new Error("Failed to extract token from magic link");
  }

  return token;
}

/**
 * Check if a Supabase auth user exists for an email
 */
export async function supabaseUserExists(email: string): Promise<boolean> {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    return data.users.some(user => user.email === email);
  } catch {
    return false;
  }
}

/**
 * Get Supabase user by email
 */
export async function getSupabaseUserByEmail(email: string) {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    return data.users.find(user => user.email === email);
  } catch {
    return null;
  }
}

/**
 * Delete a Supabase user (for cleanup on failed user creation)
 */
export async function deleteSupabaseUser(userId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.auth.admin.deleteUser(userId);
}
