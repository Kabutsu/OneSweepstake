"use client";

import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "./router";
import superjson from "superjson";
import { getBaseUrl } from "@/helpers/url";

/**
 * tRPC React hooks
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Create tRPC client for use in React components
 */
export function createTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
      }),
    ],
  });
}
