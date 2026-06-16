import { QueryClient } from '@tanstack/svelte-query';
import {
  createTRPCClient,
  createTRPCUntypedClient,
  httpBatchLink,
} from '@trpc/client';
import { initTRPC } from '@trpc/server';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { createTRPCOptionsProxy } from '../src';

/**
 * These tests verify that the adapter correctly resolves the underlying
 * TRPCUntypedClient via Symbol.for('trpc_untypedClient'), rather than using
 * `instanceof TRPCUntypedClient` or `getUntypedClient()`.
 *
 * This is critical because:
 * 1. In production builds, duplicate module resolutions can cause `instanceof`
 *    to fail across different copies of @trpc/client.
 * 2. Svelte 5 wraps values in reactive Proxy objects, which breaks `instanceof`.
 * 3. When the untyped client cannot be resolved, mutations silently hang forever
 *    because TanStack Query catches the resulting TypeError with `.catch(noop)`.
 */

const t = initTRPC.create();

const router = t.router({
  greet: t.procedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => `hello ${input.name}`),
  getUser: t.procedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => ({ id: input.id, name: `User ${input.id}` })),
});

type AppRouter = typeof router;

describe('client resolution via Symbol.for', () => {
  describe('with TRPCUntypedClient directly', () => {
    it('resolves mutation options from an untyped client', async () => {
      const untypedClient = createTRPCUntypedClient<AppRouter>({
        links: [httpBatchLink({ url: 'http://localhost:0/trpc' })],
      });

      const queryClient = new QueryClient();
      const trpc = createTRPCOptionsProxy<AppRouter>({
        client: untypedClient,
        queryClient,
      });

      const options = trpc.greet.mutationOptions();
      expect(options.mutationKey).toEqual([['greet']]);
      expect(options.mutationFn).toBeTypeOf('function');
    });

    it('resolves query options from an untyped client', () => {
      const untypedClient = createTRPCUntypedClient<AppRouter>({
        links: [httpBatchLink({ url: 'http://localhost:0/trpc' })],
      });

      const queryClient = new QueryClient();
      const trpc = createTRPCOptionsProxy<AppRouter>({
        client: untypedClient,
        queryClient,
      });

      const options = trpc.getUser.queryOptions({ id: 1 });
      expect(options.queryKey).toBeTruthy();
      expect(options.queryFn).toBeTypeOf('function');
    });
  });

  describe('with TRPCClient (typed proxy)', () => {
    it('resolves mutation options from a typed client proxy', () => {
      const client = createTRPCClient<AppRouter>({
        links: [httpBatchLink({ url: 'http://localhost:0/trpc' })],
      });

      const queryClient = new QueryClient();
      const trpc = createTRPCOptionsProxy<AppRouter>({
        client,
        queryClient,
      });

      const options = trpc.greet.mutationOptions();
      expect(options.mutationKey).toEqual([['greet']]);
      expect(options.mutationFn).toBeTypeOf('function');
    });

    it('resolves query options from a typed client proxy', () => {
      const client = createTRPCClient<AppRouter>({
        links: [httpBatchLink({ url: 'http://localhost:0/trpc' })],
      });

      const queryClient = new QueryClient();
      const trpc = createTRPCOptionsProxy<AppRouter>({
        client,
        queryClient,
      });

      const options = trpc.getUser.queryOptions({ id: 42 });
      expect(options.queryKey).toBeTruthy();
      expect(options.queryFn).toBeTypeOf('function');
    });
  });

  describe('with Proxy-wrapped client (simulating Svelte 5 reactivity)', () => {
    it('resolves mutation options through a reactive Proxy wrapper', () => {
      const client = createTRPCClient<AppRouter>({
        links: [httpBatchLink({ url: 'http://localhost:0/trpc' })],
      });

      // Simulate Svelte 5's reactive proxy wrapping
      const reactiveProxy = new Proxy(client, {
        get(target, prop, receiver) {
          return Reflect.get(target, prop, receiver);
        },
      });

      const queryClient = new QueryClient();
      const trpc = createTRPCOptionsProxy<AppRouter>({
        client: reactiveProxy,
        queryClient,
      });

      const options = trpc.greet.mutationOptions();
      expect(options.mutationKey).toEqual([['greet']]);
      expect(options.mutationFn).toBeTypeOf('function');
    });

    it('resolves query options through a reactive Proxy wrapper', () => {
      const client = createTRPCClient<AppRouter>({
        links: [httpBatchLink({ url: 'http://localhost:0/trpc' })],
      });

      const reactiveProxy = new Proxy(client, {
        get(target, prop, receiver) {
          return Reflect.get(target, prop, receiver);
        },
      });

      const queryClient = new QueryClient();
      const trpc = createTRPCOptionsProxy<AppRouter>({
        client: reactiveProxy,
        queryClient,
      });

      const options = trpc.getUser.queryOptions({ id: 7 });
      expect(options.queryKey).toBeTruthy();
      expect(options.queryFn).toBeTypeOf('function');
    });

    it('Symbol.for lookup traverses through nested Proxy layers', () => {
      const client = createTRPCClient<AppRouter>({
        links: [httpBatchLink({ url: 'http://localhost:0/trpc' })],
      });

      // Double-wrap: simulates context passing + component prop reactivity
      const innerProxy = new Proxy(client, {
        get(target, prop, receiver) {
          return Reflect.get(target, prop, receiver);
        },
      });
      const outerProxy = new Proxy(innerProxy, {
        get(target, prop, receiver) {
          return Reflect.get(target, prop, receiver);
        },
      });

      const queryClient = new QueryClient();
      const trpc = createTRPCOptionsProxy<AppRouter>({
        client: outerProxy,
        queryClient,
      });

      const options = trpc.greet.mutationOptions();
      expect(options.mutationKey).toEqual([['greet']]);
      expect(options.mutationFn).toBeTypeOf('function');
    });
  });

  describe('Symbol.for correctness', () => {
    it('typed TRPCClient exposes untypedClient via the well-known symbol', () => {
      const client = createTRPCClient<AppRouter>({
        links: [httpBatchLink({ url: 'http://localhost:0/trpc' })],
      });

      const untypedClient = (client as any)[Symbol.for('trpc_untypedClient')];
      expect(untypedClient).toBeTruthy();
      expect(untypedClient.query).toBeTypeOf('function');
      expect(untypedClient.mutation).toBeTypeOf('function');
      expect(untypedClient.subscription).toBeTypeOf('function');
    });

    it('TRPCUntypedClient does NOT have the symbol (falls back to itself)', () => {
      const untypedClient = createTRPCUntypedClient<AppRouter>({
        links: [httpBatchLink({ url: 'http://localhost:0/trpc' })],
      });

      // The untyped client itself doesn't have this symbol key set,
      // so the fallback `|| client` is used
      const resolved =
        (untypedClient as any)[Symbol.for('trpc_untypedClient')] ||
        untypedClient;
      expect(resolved).toBe(untypedClient);
      expect(resolved.query).toBeTypeOf('function');
      expect(resolved.mutation).toBeTypeOf('function');
    });

    it('Proxy-wrapped client preserves symbol access', () => {
      const client = createTRPCClient<AppRouter>({
        links: [httpBatchLink({ url: 'http://localhost:0/trpc' })],
      });

      const wrapped = new Proxy(client, {
        get(target, prop, receiver) {
          return Reflect.get(target, prop, receiver);
        },
      });

      const untypedClient = (wrapped as any)[Symbol.for('trpc_untypedClient')];
      expect(untypedClient).toBeTruthy();
      expect(untypedClient.query).toBeTypeOf('function');
      expect(untypedClient.mutation).toBeTypeOf('function');
    });
  });
});
