# trpc-tanstack-svelte-query

TanStack Svelte Query integration for [tRPC](https://trpc.io).

Inspired by [`@trpc/tanstack-react-query`](https://www.npmjs.com/package/@trpc/tanstack-react-query), this package brings the same option-factory API (`queryOptions`, `mutationOptions`, `queryKey`, `queryFilter`, etc.) to Svelte apps using [`@tanstack/svelte-query`](https://tanstack.com/query/latest/docs/framework/svelte/overview).

Requires `@tanstack/svelte-query` ^6, `@trpc/client` & `@trpc/server` ^11.17.0, `svelte` ^5.25.0, and `typescript` >=5.7.2.

## Installation

```bash
bun add trpc-tanstack-svelte-query @tanstack/svelte-query @trpc/client @trpc/server
```

## Setup

Create a typed tRPC context and client:

```ts
// lib/trpc/client.ts
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from 'trpc-tanstack-svelte-query';
import type { AppRouter } from './routes';

export const client = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: '/api/trpc' })],
});

export const { useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();
```

Wrap your app with TanStack Query and the tRPC provider:

```svelte
<!-- routes/+layout.svelte -->
<script lang="ts">
  import { QueryClientProvider } from '@tanstack/svelte-query';
  import TRPCProvider from 'trpc-tanstack-svelte-query/TRPCContext.svelte';
  import { client } from '$lib/trpc/client';
  import { queryClient } from '$lib/trpc/queryClient';

  let { children } = $props();
</script>

<QueryClientProvider client={queryClient}>
  <TRPCProvider trpcClient={client} {queryClient}>
    {@render children()}
  </TRPCProvider>
</QueryClientProvider>
```

Call `createTRPCContext()` in a module that loads before `TRPCProvider` mounts (for example `lib/trpc/client.ts`), so the provider can wire up the context.

## Usage

```svelte
<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { useTRPC } from '$lib/trpc/client';

  const trpc = useTRPC();

  const addQuery = createQuery(() => trpc.add.queryOptions({ a: 1, b: 2 }));
</script>

{#if addQuery.isPending}
  <p>Loading...</p>
{:else}
  <p>{addQuery.data}</p>
{/if}
```

## API

- `createTRPCContext()` — create `useTRPC` / `useTRPCClient` helpers backed by Svelte context
- `createTRPCOptionsProxy()` — singleton-style setup without a provider (SPA)
- `TRPCContext.svelte` — provider component that connects a tRPC client and `QueryClient`

For broader tRPC + TanStack Query concepts, see the [React package docs](https://trpc.io/docs/client/tanstack-react-query/setup); the Svelte API mirrors it closely.
