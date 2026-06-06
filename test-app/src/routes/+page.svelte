<script lang="ts">
	import { createQuery } from "@tanstack/svelte-query";
	import { client } from "$lib/trpc/client";

	const a = 2;
	const b = 3;

	const addQuery = createQuery(() => ({
		queryKey: ["add", a, b],
		queryFn: () => client.add.query({ a, b }),
	}));
</script>

<h1>tRPC + TanStack Query</h1>

{#if addQuery.isPending}
	<p>Loading...</p>
{:else if addQuery.isError}
	<p>Error: {addQuery.error.message}</p>
{:else}
	<p>{a} + {b} = {addQuery.data}</p>
{/if}
