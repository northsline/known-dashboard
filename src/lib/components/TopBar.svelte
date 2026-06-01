<script lang="ts">
	import { known } from '$lib/stores/known.svelte';
	import { download } from '$lib/utils';
	import { t } from '$lib/i18n';

	interface Props {
		title: string;
		eyebrow: string;
	}
	let { title, eyebrow }: Props = $props();

	let canExport = $derived(known.hasData);

	function exportEvents() {
		if (!canExport) return;
		download(`known-export-${Date.now()}.json`, known.exportJSON());
	}
</script>

<header class="topbar">
	<div class="topbar-head">
		<span class="eyebrow">{eyebrow}</span>
		<h1 class="topbar-title">{@html title}</h1>
	</div>

	<div class="topbar-actions">
		<button
			class="btn-ghost btn-sm"
			onclick={() => known.togglePause()}
			disabled={!known.connected}
			title={known.paused ? t.actions.resume : t.actions.pause}
		>
			{known.paused ? t.actions.resume : t.actions.pause}
		</button>
		<button
			class="btn-ghost btn-sm"
			onclick={() => (known.connected ? known.stop() : known.discover())}
			disabled={known.connecting}
			title={known.connected ? t.actions.disconnect : t.actions.connect}
		>
			{known.connecting ? t.connection.searching : known.connected ? t.actions.disconnect : t.actions.connect}
		</button>
		<button
			class="btn-primary btn-sm"
			onclick={exportEvents}
			disabled={!canExport}
			title={t.actions.exportJson}
		>
			{t.actions.exportJson}
		</button>
	</div>
</header>

<style>
	.topbar {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 24px;
		padding: 28px 0 20px;
		flex-wrap: wrap;
	}
	.topbar-head {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.topbar-title {
		font-family: 'Instrument Sans', sans-serif;
		font-weight: 500;
		font-size: clamp(26px, 2.8vw, 34px);
		line-height: 1.05;
		letter-spacing: -0.032em;
		color: var(--ink);
	}
	:global(.topbar-title em) {
		font-family: 'Instrument Serif', serif;
		font-style: italic;
		font-weight: 400;
		letter-spacing: -0.02em;
	}
	.topbar-actions {
		display: flex;
		gap: 10px;
		align-items: center;
		flex-wrap: wrap;
	}
</style>
