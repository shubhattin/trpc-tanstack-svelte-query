<script lang="ts">
	import "../app.css";
	import { QueryClientProvider } from "@tanstack/svelte-query";
	import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools";
	import favicon from "$lib/assets/favicon.svg";
	import { setTrpcContext } from "$lib/trpc/client";
	import { queryClient } from "$lib/trpc/queryClient";
	import { themeState } from "$lib/theme.svelte";
	import { dev } from "$app/environment";

	setTrpcContext();
	themeState.init();

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>tRPC + TanStack Svelte Query</title>
</svelte:head>

<QueryClientProvider client={queryClient}>
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
