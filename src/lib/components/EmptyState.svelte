<script lang="ts">
	import { known } from '$lib/stores/known.svelte';

	interface Props {
		title: string;
		body?: string;
		searching?: boolean;
		compact?: boolean;
	}
	let { title, body, searching = false, compact = false }: Props = $props();

	let active = $derived(searching && known.connecting);
</script>

<div class="empty" class:compact role="status" aria-live="polite">
	<div class="empty-icon" class:pulse={active} aria-hidden="true">
		{#if searching}
			<!-- Wi-Fi / radar: scanning the network. -->
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
				<path d="M5 12.55a11 11 0 0 1 14 0" />
				<path d="M8.5 16.1a6 6 0 0 1 7 0" />
				<path d="M12 19.5h.01" />
			</svg>
		{:else}
			<!-- Inbox / no records. -->
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
				<path d="M3 12h5l1.5 3h5L21 12" />
				<path d="M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
			</svg>
		{/if}
	</div>
	<p class="empty-title">{title}</p>
	{#if body}
		<p class="empty-body">{body}</p>
	{/if}
</div>

<style>
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 10px;
		padding: 36px 24px;
	}
	.empty.compact {
		padding: 26px 20px;
		gap: 8px;
	}

	.empty-icon {
		width: 34px;
		height: 34px;
		color: var(--ink-faint);
		margin-bottom: 2px;
	}
	.empty-icon svg {
		width: 100%;
		height: 100%;
	}
	.empty-icon.pulse {
		color: var(--warn);
		animation: iconPulse 1.6s var(--ease-soft) infinite;
	}
	@keyframes iconPulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.45;
		}
	}

	.empty-title {
		font-size: 14.5px;
		font-weight: 500;
		letter-spacing: -0.01em;
		color: var(--ink);
	}
	.empty.compact .empty-title {
		font-size: 13.5px;
	}
	.empty-body {
		font-size: 13px;
		line-height: 1.5;
		color: var(--ink-mute);
		max-width: 40ch;
	}
</style>
