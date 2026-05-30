<script lang="ts">
	import { known } from '$lib/stores/known.svelte';
	import { t } from '$lib/i18n';
</script>

{#if !known.connected}
	<div class="banner" role="status" aria-live="polite">
		<span class="banner-dot" class:searching={known.connecting}></span>
		<span class="banner-text">{t.connection.bannerOffline}</span>
	</div>
{/if}

<style>
	.banner {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 16px;
		padding: 11px 16px;
		border-radius: var(--r-md);
		background: var(--warn-soft);
		border: 1px solid oklch(0.72 0.11 70 / 0.28);
		font-size: 13px;
		line-height: 1.4;
		color: var(--ink-soft);
	}
	.banner-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--warn);
		flex-shrink: 0;
	}
	.banner-text {
		min-width: 0;
	}
</style>
