import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const router = t.router({
	add: t.procedure
		.input(z.object({ a: z.number(), b: z.number() }))
		.query(async ({ input }) => {
			await new Promise(resolve => setTimeout(resolve, 1000));
			return input.a + input.b
		}),
	greet: t.procedure
		.input(z.object({ name: z.string() }))
		.mutation(async ({ input }) => {
			await new Promise(resolve => setTimeout(resolve, 500));
			return `Hello, ${input.name}!`;
		})
});

export type AppRouter = typeof router;
