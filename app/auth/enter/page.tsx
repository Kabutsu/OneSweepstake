import { isPasswordVerified } from "@/lib/auth/cookies";
import EnterPageClient from "./page-client";

export default async function EnterPage() {
  // Server-side password cookie check for better performance
  const passwordVerified = await isPasswordVerified();
  const initialStep = passwordVerified ? "email" : "password";

  return <EnterPageClient initialStep={initialStep} />;
}
