import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext, createTRPCOptionsProxy } from '@trpc/tanstack-svelte-query';
import { queryClient } from './queryClient';
import type { AppRouter } from './routes';

export const client = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: '/api/trpc'
		})
	]
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client,
	queryClient
});

const trpcContext = createTRPCContext<AppRouter>();

export const setTrpcContext = () =>
	trpcContext.setTRPCContext({
		trpcClient: client,
		queryClient
	});

export const useTrpc = trpcContext.useTrpc;
export const useTrpcClient = trpcContext.useTrpcClient;
