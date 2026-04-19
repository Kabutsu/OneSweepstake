import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { appRouter } from "./router";
import { createContext } from "./context";
import { getBaseUrl } from "@/helpers/url";

/**
 * Create a server-side tRPC caller for use in server components
 * Cached per request to avoid duplicate context creation
 */
export const createCaller = cache(async () => {
  const headersList = await headers();
  const baseUrl = getBaseUrl();
  
  // Create a context with the current request headers
  const ctx = await createContext({
    req: new Request(baseUrl, {
      headers: headersList,
    }),
    resHeaders: new Headers(),
    info: {
      isBatchCall: false,
      calls: [],
      accept: "application/jsonl" as const,
      type: "query" as const,
      connectionParams: null,
      signal: new AbortController().signal,
      url: new URL(baseUrl),
    },
  });

  return appRouter.createCaller(ctx);
});
