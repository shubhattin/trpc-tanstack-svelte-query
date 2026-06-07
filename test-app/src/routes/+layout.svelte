<script lang="ts">
	import "../app.css";
	import { QueryClientProvider } from "@tanstack/svelte-query";
	import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools";
	import favicon from "$lib/assets/favicon.svg";
	import { queryClient } from "$lib/trpc/queryClient";
	import { themeState } from "$lib/theme.svelte";
	import { dev } from "$app/environment";
	import TRPCProvider from "trpc-tanstack-svelte-query/TRPCContext.svelte";

	import { client } from "$lib/trpc/client";
	themeState.init();

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>tRPC + TanStack Svelte Query</title>
</svelte:head>

<QueryClientProvider client={queryClient}>
	<TRPCProvider trpcClient={client} {queryClient}>
		<div class="app">
			<header class="header">
				<button
					type="button"
					class="theme-toggle"
					onclick={() => themeState.toggle()}
					aria-label="Toggle dark mode"
				>
					{themeState.theme === "dark" ? "Light mode" : "Dark mode"}
				</button>
			</header>
			<main class="main">
				{@render children()}
			</main>
		</div>
		{#if dev}
			<SvelteQueryDevtools />
		{/if}
	</TRPCProvider>
</QueryClientProvider>

<style>
	.app {
		min-height: 100vh;
	}

	.header {
		display: flex;
		justify-content: flex-end;
		padding: 1rem;
	}

	.main {
		padding: 0 1rem 2rem;
		max-width: 40rem;
		margin: 0 auto;
	}

	.theme-toggle {
		font-size: 0.875rem;
	}
</style>
