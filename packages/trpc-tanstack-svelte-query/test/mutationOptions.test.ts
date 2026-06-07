import { QueryClient } from '@tanstack/svelte-query';
import { initTRPC } from '@trpc/server';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createTRPCOptionsProxy } from '../src';

const t = initTRPC.create();

const router = t.router({
  greet: t.procedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => `hello ${input.name}`),
});

describe('mutation procedures', () => {
  it('exposes mutationOptions and mutationKey', async () => {
    const queryClient = new QueryClient();
    const trpc = createTRPCOptionsProxy({
      router,
      ctx: {},
      queryClient,
    });

    expect(trpc.greet.mutationKey()).toEqual([['greet']]);

    const options = trpc.greet.mutationOptions();
    expect(options.mutationKey).toEqual([['greet']]);
    expect(options.trpc.path).toBe('greet');
    expect(await options.mutationFn?.({ name: 'world' })).toBe('hello world');
  });
});
