import React, { useState } from "react";
import { api } from "../utils/api";
import Constants from "expo-constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { getAuth } from "firebase/auth";

const getBaseUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0];

  if (!localhost) {
    // return production https;
    throw new Error(
      "Failed to get localhost. Please point to your production server."
    );
  }
  return `http://${localhost}:3000`;
};

export function TRPCProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            cacheTime: 1000 * 60 * 60 * 24, // 24 hours
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    api.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          async headers() {
            const user = getAuth().currentUser;
            const headers = new Map<string, string>();
            headers.set("x-trpc-source", "expo-react");
            const token = await user!.getIdToken();
            headers.set("authorization", `Bearer ${token}`);
            return Object.fromEntries(headers);
          },
        }),
      ],
    })
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </api.Provider>
  );
}
