<script
  lang="ts"
  generics="TRouter extends AnyTRPCRouter, TFeatureFlags extends FeatureFlags = DefaultFeatureFlags"
>
  import type { QueryClient } from '@tanstack/svelte-query';
  import type { TRPCClient } from '@trpc/client';
  import type { AnyTRPCRouter } from '@trpc/server';
  import type { Snippet } from 'svelte';
  import type {
    CreateTRPCContextResult,
    SetTRPCContextOptions,
  } from './internals/Context';
  import { getDefaultTRPCContext } from './internals/Context';
  import type { DefaultFeatureFlags, FeatureFlags } from './internals/types';

  type Props = SetTRPCContextOptions<TRouter, TFeatureFlags> & {
    context?: CreateTRPCContextResult<TRouter, TFeatureFlags>;
    children?: Snippet;
  };

  let {
    context,
    trpcClient,
    queryClient,
    keyPrefix,
    children,
  }: Props = $props();

  (() => {
    const resolvedContext =
      context ??
      (getDefaultTRPCContext() as
        | CreateTRPCContextResult<TRouter, TFeatureFlags>
        | undefined);

    if (!resolvedContext) {
      throw new Error(
        'TRPCContext requires either a `context` prop or a previously created default context from createTRPCContext().',
      );
    }

    resolvedContext.setTRPCContext({
      trpcClient,
      queryClient,
      keyPrefix,
    } as SetTRPCContextOptions<TRouter, TFeatureFlags>);
  })();
</script>

{@render children?.()}
