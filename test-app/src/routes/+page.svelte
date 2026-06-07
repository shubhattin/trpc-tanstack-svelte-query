<script lang="ts">
	import { createMutation, createQuery } from "@tanstack/svelte-query";
	import { useTRPC, useTRPCClient } from "$lib/trpc/client";
	import { queryClient } from "$lib/trpc/queryClient";

	const trpc = useTRPC();
	const trpcClient = useTRPCClient();

	let a = $state(2);
	let b = $state(3);
	let keyA = $state(5);
	let keyB = $state(7);
	let includeKeyA = $state(true);
	let includeKeyB = $state(true);
	let directResult = $state<number | null>(null);
	let name = $state("world");
	let lastGreetResult = $state<string | null>(null);

	const addQuery = createQuery(() => trpc.add.queryOptions({ a, b }));
	const greetMutation = createMutation(() =>
		trpc.greet.mutationOptions({
			onSuccess: (message) => {
				lastGreetResult = message;
			},
		}),
	);

	const addQueryKey = $derived(trpc.add.queryKey({ a, b }));
	const addQueryFilter = $derived(trpc.add.queryFilter({ a, b }));
	const greetMutationKey = trpc.greet.mutationKey();
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
		await queryClient.invalidateQueries(addQueryFilter);
	}

	async function invalidateManualQuery() {
		await queryClient.invalidateQueries({ queryKey: manualQueryKey });
	}
</script>

<h1>tRPC + TanStack Svelte Query</h1>

<section class="section first-section">
	<h2>Query</h2>
	<p class="section-desc">
		Uses <code>trpc.add.queryOptions()</code>, <code>queryKey()</code>, and
		<code>queryFilter()</code> with <code>createQuery</code>.
	</p>

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
<p class="meta">
	Query filter: <code>{JSON.stringify(addQueryFilter)}</code>
</p>

{#if directResult !== null}
	<p>Direct client result: {directResult}</p>
{/if}
</section>

<section class="section">
	<h2>Mutation</h2>
	<p class="section-desc">
		Uses <code>trpc.greet.mutationOptions()</code> and
		<code>mutationKey()</code> with <code>createMutation</code>.
	</p>
	<form class="form" onsubmit={(e) => e.preventDefault()}>
		<label>
			name
			<input type="text" bind:value={name} />
		</label>
	</form>
	<div class="actions">
		<button
			type="button"
			disabled={greetMutation.isPending}
			onclick={() => greetMutation.mutate({ name })}
		>
			{greetMutation.isPending ? "Greeting..." : "Run greet mutation"}
		</button>
	</div>
	{#if greetMutation.isError}
		<p>Error: {greetMutation.error.message}</p>
	{:else if greetMutation.data ?? lastGreetResult}
		<p>{greetMutation.data ?? lastGreetResult}</p>
	{/if}
	<p class="meta">
		Mutation key: <code>{JSON.stringify(greetMutationKey)}</code>
	</p>
</section>

<section class="section">
	<h2>Manual query key invalidation</h2>
	<p class="section-desc">
		Enter values and choose which fields are included in the query key
		input.
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

	input[type="number"],
	input[type="text"] {
		width: 5rem;
		padding: 0.25rem 0.5rem;
	}

	input[type="text"] {
		width: 10rem;
	}

	input[type="checkbox"] {
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

	.first-section {
		margin-top: 0;
		padding-top: 0;
		border-top: none;
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
