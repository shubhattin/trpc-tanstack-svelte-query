import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { router } from '$lib/trpc/routes';
import type { RequestHandler } from './$types';

const handler: RequestHandler = (event) =>
	fetchRequestHandler({
		endpoint: '/api/trpc',
		req: event.request,
		router,
		createContext: () => ({})
	});

export const GET = handler;
export const POST = handler;
