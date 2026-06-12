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
	let showExplainer = $state(false);

	function exportEvents() {
		if (!canExport) return;
		download(`known-export-${Date.now()}.json`, known.exportJSON());
	}

	function closeExplainer() {
		showExplainer = false;
	}

	function onBackdropKey(e: KeyboardEvent) {
		if (e.key === 'Escape') closeExplainer();
	}

	function trapModalKey(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			closeExplainer();
		}
	}
</script>

<header class="topbar">
	<div class="topbar-head">
		<div class="topbar-eyebrow-row">
			<span class="eyebrow">{eyebrow}</span>
			<button
				class="what-link"
				type="button"
				onclick={() => (showExplainer = true)}
				aria-haspopup="dialog"
				aria-controls="explainer-modal"
			>
				{t.actions.whatIsThis}
			</button>
		</div>
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

{#if showExplainer}
	<div
		class="modal-backdrop"
		role="presentation"
		onclick={closeExplainer}
		onkeydown={onBackdropKey}
		tabindex="-1"
	>
		<div
			id="explainer-modal"
			class="modal"
			role="dialog"
			aria-modal="true"
			aria-labelledby="explainer-title"
			onclick={(e) => e.stopPropagation()}
			onkeydown={trapModalKey}
		>
			<div class="modal-head">
				<span id="explainer-title" class="eyebrow">{t.explainer.eyebrow}</span>
				<button
					class="modal-close"
					type="button"
					onclick={closeExplainer}
					aria-label="Close"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			</div>
			<p class="modal-body">{@html t.explainer.body}</p>
		</div>
	</div>
{/if}

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
	.topbar-eyebrow-row {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.what-link {
		font-size: 11.5px;
		color: var(--ink-mute);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: color 0.15s var(--ease);
	}
	.what-link:hover {
		color: var(--ink-soft);
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
	.topbar-actions > :global(button:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
		border-radius: var(--r-sm);
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.25);
		backdrop-filter: blur(2px);
		z-index: 100;
		display: grid;
		place-items: center;
		padding: 24px;
		animation: fadeIn 0.18s var(--ease);
	}
	.modal-backdrop:focus-visible {
		outline: none;
	}
	.modal {
		background: var(--bg-card);
		border: 1px solid var(--ink-hair);
		border-radius: var(--r-lg);
		box-shadow: var(--shadow-pop);
		max-width: 440px;
		width: 100%;
		padding: 22px 24px 24px;
		animation: rise 0.2s var(--ease-out);
	}
	.modal:focus-visible {
		outline: none;
	}
	.modal-close:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
		border-radius: var(--r-sm);
	}
	.what-link:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
		border-radius: 2px;
	}
	.modal-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 14px;
	}
	.modal-close {
		width: 28px;
		height: 28px;
		border-radius: var(--r-sm);
		display: grid;
		place-items: center;
		color: var(--ink-mute);
		background: none;
		border: none;
		cursor: pointer;
		transition: color 0.15s var(--ease);
	}
	.modal-close svg {
		width: 16px;
		height: 16px;
	}
	.modal-close:hover {
		color: var(--ink);
	}
	.modal-body {
		font-size: 14.5px;
		line-height: 1.55;
		color: var(--ink-soft);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
