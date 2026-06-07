import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const router = t.router({
	add: t.procedure
		.input(z.object({ a: z.number(), b: z.number() }))
		.query(async ({ input }) => {
			await new Promise(resolve => setTimeout(resolve, 1000));
			return input.a + input.b
		})
});

export type AppRouter = typeof router;
