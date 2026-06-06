import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './routes';

export const client = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: '/api/trpc'
		})
	]
});
