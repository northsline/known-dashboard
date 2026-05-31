<script lang="ts">
	import '$lib/styles/app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import StickerGate from '$lib/components/StickerGate.svelte';
	import ConnectionBanner from '$lib/components/ConnectionBanner.svelte';
	import { known } from '$lib/stores/known.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		// If a code was restored from storage, begin searching for the device.
		if (known.onboarded) known.start();
		return () => known.stop();
	});
</script>

{#if !known.onboarded}
	<StickerGate />
{:else}
	<div class="shell">
		<Sidebar />
		<main class="content">
			<ConnectionBanner />
			{@render children()}
		</main>
	</div>
{/if}

<style>
	.shell {
		display: flex;
		min-height: 100vh;
		align-items: stretch;
	}
	.content {
		flex: 1;
		min-width: 0;
		padding: 0 clamp(24px, 4vw, 56px) 80px;
		max-width: 1500px;
	}
	@media (max-width: 880px) {
		.shell {
			flex-direction: column;
		}
	}
</style>
