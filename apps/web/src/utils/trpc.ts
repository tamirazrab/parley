import { defaultShouldDehydrateQuery, QueryCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@parley/api/routers/index";
import { toast } from "sonner";
import { cache } from "react";

function makeQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
    },
    queryCache: new QueryCache({
      onError: (error) => {
        // using closure-safe lazy reference
        toast.error(error.message, {
          action: {
            label: "retry",
            onClick: () => {
              // safely re-fetch all queries
              queryClient.invalidateQueries();
            },
          },
        });
      },
    }),
  });

  return queryClient;
}

export const getQueryClient = cache(makeQueryClient);

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});