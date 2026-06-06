import type { QueryClient } from '@tanstack/svelte-query';
import type { TRPCClient } from '@trpc/client';
import type { AnyTRPCRouter } from '@trpc/server';
import { createContext } from 'svelte';
import type { TRPCOptionsProxy } from './createOptionsProxy';
import { createTRPCOptionsProxy } from './createOptionsProxy';
import type {
  DefaultFeatureFlags,
  FeatureFlags,
  KeyPrefixOptions,
} from './types';

export type SetTRPCContextOptions<
  TRouter extends AnyTRPCRouter,
  TFeatureFlags extends FeatureFlags = DefaultFeatureFlags,
> = {
  queryClient: QueryClient;
  trpcClient: TRPCClient<TRouter> | object;
} & KeyPrefixOptions<TFeatureFlags>;

export interface CreateTRPCContextResult<
  TRouter extends AnyTRPCRouter,
  TFeatureFlags extends FeatureFlags = DefaultFeatureFlags,
> {
  setTRPCContext: (
    opts: SetTRPCContextOptions<TRouter, TFeatureFlags>,
  ) => TRPCOptionsProxy<TRouter, TFeatureFlags>;
  useTRPC: () => TRPCOptionsProxy<TRouter, TFeatureFlags>;
  useTrpc: () => TRPCOptionsProxy<TRouter, TFeatureFlags>;
  useTRPCClient: () => TRPCClient<TRouter>;
  useTrpcClient: () => TRPCClient<TRouter>;
}

/**
 * Create a set of type-safe Svelte context helpers.
 *
 * Call `setTRPCContext()` during a parent component's initialization, then
 * `useTRPC()`/`useTRPCClient()` from descendants.
 */
export function createTRPCContext<
  TRouter extends AnyTRPCRouter,
  TFeatureFlags extends FeatureFlags = DefaultFeatureFlags,
>(): CreateTRPCContextResult<TRouter, TFeatureFlags> {
  const [useTRPCClient, setTRPCClient] = createContext<TRPCClient<TRouter>>();
  const [useTRPC, setTRPC] = createContext<TRPCOptionsProxy<
    TRouter,
    TFeatureFlags
  >>();

  function setTRPCContext(
    opts: SetTRPCContextOptions<TRouter, TFeatureFlags>,
  ) {
    const trpc = createTRPCOptionsProxy<TRouter, TFeatureFlags>({
      client: opts.trpcClient,
      queryClient: opts.queryClient,
      keyPrefix: opts.keyPrefix as any,
    });

    setTRPCClient(opts.trpcClient as TRPCClient<TRouter>);
    return setTRPC(trpc);
  }

  const useTrpc = useTRPC;
  const useTrpcClient = useTRPCClient;

  return { setTRPCContext, useTRPC, useTrpc, useTRPCClient, useTrpcClient };
}
