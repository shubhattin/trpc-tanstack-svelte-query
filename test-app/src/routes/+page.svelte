<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { useTrpc, useTrpcClient } from '$lib/trpc/client';

	const trpc = useTrpc();
	const trpcClient = useTrpcClient();

	let a = $state(2);
	let b = $state(3);
	let directResult = $state<number | null>(null);

	const addQuery = createQuery(() => trpc.add.queryOptions({ a, b }));

	async function runDirectQuery() {
		directResult = await trpcClient.add.query({ a, b });
	}
</script>

<h1>tRPC + TanStack Svelte Query</h1>

<form class="form" onsubmit={(e) => e.preventDefault()}>
	<label>
		a
		<input type="number" bind:value={a} />
	</label>
	<label>
		b
		<input type="number" bind:value={b} />
	</label>
</form>

{#if addQuery.isPending}
	<p>Loading...</p>
{:else if addQuery.isError}
	<p>Error: {addQuery.error.message}</p>
{:else}
	<p>{a} + {b} = {addQuery.data}</p>
{/if}

<button type="button" onclick={runDirectQuery}>Run direct client query</button>

{#if directResult !== null}
	<p>Direct client result: {directResult}</p>
{/if}

<style>
	.form {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	input {
		width: 5rem;
		padding: 0.25rem 0.5rem;
	}

	button {
		margin-top: 0.5rem;
	}
</style>
