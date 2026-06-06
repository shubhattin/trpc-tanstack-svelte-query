<script lang="ts">
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import favicon from '$lib/assets/favicon.svg';
	import { setTrpcContext } from '$lib/trpc/client';
	import { queryClient } from '$lib/trpc/queryClient';

	setTrpcContext();

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>
