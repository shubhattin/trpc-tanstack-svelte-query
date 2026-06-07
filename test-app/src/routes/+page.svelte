<script lang="ts">
	import { createQuery } from "@tanstack/svelte-query";
	import { useTrpc, useTrpcClient } from "$lib/trpc/client";
	import { queryClient } from "$lib/trpc/queryClient";

	const trpc = useTrpc();
	const trpcClient = useTrpcClient();

	let a = $state(2);
	let b = $state(3);
	let keyA = $state(5);
	let keyB = $state(7);
	let includeKeyA = $state(true);
	let includeKeyB = $state(true);
	let directResult = $state<number | null>(null);

	const addQuery = createQuery(() => trpc.add.queryOptions({ a, b }));

	const addQueryKey = $derived(trpc.add.queryKey({ a, b }));
	const manualQueryKey = $derived(
		trpc.add.queryKey({
			...(includeKeyA ? { a: keyA } : {}),
			...(includeKeyB ? { b: keyB } : {}),
		}),
	);

	async function runDirectQuery() {
		directResult = await trpcClient.add.query({ a, b });
	}

	function setStaleCache() {
		queryClient.setQueryData(addQueryKey, -1);
	}

	async function invalidateAddQuery() {
		await queryClient.invalidateQueries({ queryKey: addQueryKey });
	}

	async function invalidateManualQuery() {
		await queryClient.invalidateQueries({ queryKey: manualQueryKey });
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
	<p>
		{a} + {b} = {addQuery.data}
		{#if addQuery.isFetching}
			Fetching...
		{/if}
	</p>
{/if}

<div class="actions">
	<button type="button" onclick={runDirectQuery}
		>Run direct client query</button
	>
	<button type="button" onclick={setStaleCache}>Set stale cache (-1)</button>
	<button type="button" onclick={invalidateAddQuery}>Invalidate cache</button>
</div>

<p class="meta">Query key: <code>{JSON.stringify(addQueryKey)}</code></p>

{#if directResult !== null}
	<p>Direct client result: {directResult}</p>
{/if}

<section class="section">
	<h2>Manual query key invalidation</h2>
	<p class="section-desc">
		Enter values and choose which fields are included in the query key input.
	</p>

	<form class="form" onsubmit={(e) => e.preventDefault()}>
		<label>
			<span class="label-row">
				<input type="checkbox" bind:checked={includeKeyA} />
				a
			</span>
			<input type="number" bind:value={keyA} disabled={!includeKeyA} />
		</label>
		<label>
			<span class="label-row">
				<input type="checkbox" bind:checked={includeKeyB} />
				b
			</span>
			<input type="number" bind:value={keyB} disabled={!includeKeyB} />
		</label>
	</form>

	<p class="meta">
		Generated key: <code>{JSON.stringify(manualQueryKey)}</code>
	</p>

	<div class="actions">
		<button type="button" onclick={invalidateManualQuery}
			>Invalidate this key</button
		>
	</div>
</section>

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

	.label-row {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	input[type='number'] {
		width: 5rem;
		padding: 0.25rem 0.5rem;
	}

	input[type='checkbox'] {
		width: auto;
		margin: 0;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.meta {
		margin-top: 1rem;
		font-size: 0.875rem;
		color: var(--muted);
	}

	code {
		font-size: 0.8125rem;
	}

	.section {
		margin-top: 2.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
	}

	.section h2 {
		margin: 0 0 0.5rem;
		font-size: 1.125rem;
	}

	.section-desc {
		margin: 0 0 1rem;
		font-size: 0.875rem;
		color: var(--muted);
	}
</style>
