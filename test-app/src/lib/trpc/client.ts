import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from 'trpc-tanstack-svelte-query';
import type { AppRouter } from './routes';

export const client = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: '/api/trpc'
		})
	]
});

export const { useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();
