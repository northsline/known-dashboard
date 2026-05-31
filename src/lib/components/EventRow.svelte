<script lang="ts">
	import type { NetEvent } from '$lib/types';
	import { known } from '$lib/stores/known.svelte';
	import { formatBytes } from '$lib/data/generate';
	import { clockTime, severityColor, severityLabel, detectionLabel, deviceGlyph } from '$lib/utils';

	interface Props {
		event: NetEvent;
		fresh?: boolean;
	}
	let { event, fresh = false }: Props = $props();

	let device = $derived(known.deviceById.get(event.deviceId));
</script>

<div class="row" class:fresh data-sev={event.severity}>
	<span class="row-rail" style="background:{severityColor(event.severity)}"></span>

	<div class="row-time mono">{clockTime(event.ts)}</div>

	<div class="row-device">
		<span class="dev-glyph">{device ? deviceGlyph(device.category) : '?'}</span>
		<span class="dev-name">{device?.name ?? 'Unknown device'}</span>
	</div>

	<div class="row-domain">
		<span class="domain mono">{event.domain}</span>
		<span class="meta mono">
			{event.ip} · {event.country} · {event.encrypted ? 'TLS' : 'cleartext'}
		</span>
	</div>

	<div class="row-kind">
		<span class="kind-dot" style="background:{severityColor(event.severity)}"></span>
		<span class="kind-label">{detectionLabel(event.kind)}</span>
	</div>

	<div class="row-bytes mono">{formatBytes(event.bytes)}</div>

	<div class="row-sev mono" style="color:{severityColor(event.severity)}">
		{severityLabel(event.severity)}
	</div>
</div>

<style>
	.row {
		position: relative;
		display: grid;
		grid-template-columns: 88px 1.3fr 1.6fr 1.2fr 86px 70px;
		align-items: center;
		gap: 18px;
		padding: 14px 18px 14px 22px;
		border-bottom: 1px solid var(--ink-hair);
		transition:
			background 0.18s var(--ease),
			padding 0.25s var(--ease);
	}
	.row:hover {
		background: var(--ink-hair-2);
	}
	.row.fresh {
		animation: rise 0.5s var(--ease-out);
	}
	.row-rail {
		position: absolute;
		left: 10px;
		top: 50%;
		transform: translateY(-50%);
		width: 5px;
		height: 5px;
		border-radius: 50%;
		opacity: 0;
		transition: opacity 0.2s var(--ease);
	}
	.row[data-sev='alert'] .row-rail {
		opacity: 1;
	}
	.row[data-sev='watch'] .row-rail {
		opacity: 0.5;
	}

	.row-time {
		font-size: 12px;
		color: var(--ink-mute);
	}
	.row-device {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
	}
	.dev-glyph {
		width: 24px;
		height: 24px;
		flex-shrink: 0;
		display: grid;
		place-items: center;
		border-radius: 6px;
		background: var(--bg-sunken);
		font-size: 12px;
		color: var(--ink-mute);
	}
	.dev-name {
		font-size: 13.5px;
		font-weight: 500;
		letter-spacing: -0.01em;
		color: var(--ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.row-domain {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.domain {
		font-size: 12.5px;
		color: var(--ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.meta {
		font-size: 10.5px;
		color: var(--ink-mute);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.row-kind {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}
	.kind-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.kind-label {
		font-size: 12.5px;
		color: var(--ink-soft);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.row-bytes {
		font-size: 12px;
		color: var(--ink-soft);
		text-align: right;
	}
	.row-sev {
		font-size: 10.5px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-align: right;
	}

	@media (max-width: 1100px) {
		.row {
			grid-template-columns: 70px 1.2fr 1.6fr 64px;
			gap: 12px;
		}
		.row-kind,
		.row-sev {
			display: none;
		}
	}
	@media (max-width: 680px) {
		.row {
			grid-template-columns: 1fr auto;
			gap: 6px 12px;
			padding: 14px 16px;
		}
		.row-time {
			order: 1;
		}
		.row-bytes {
			order: 2;
		}
		.row-device {
			order: 3;
			grid-column: 1 / -1;
		}
		.row-domain {
			order: 4;
			grid-column: 1 / -1;
		}
	}
</style>
