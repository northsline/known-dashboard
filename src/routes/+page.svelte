<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import TrafficChart from '$lib/components/TrafficChart.svelte';
	import EventRow from '$lib/components/EventRow.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { known } from '$lib/stores/known.svelte';
	import { DETECTIONS } from '$lib/data/detections';
	import { formatBytes } from '$lib/utils';
	import { t } from '$lib/i18n';
	import type { DetectionKind, Severity } from '$lib/types';
	import { goto } from '$app/navigation';

	// Time range drives both the chart and the stat window.
	const ranges = [
		{ id: '1h', label: t.timeline.range1h, ms: 1000 * 60 * 60, buckets: 30 },
		{ id: '6h', label: t.timeline.range6h, ms: 1000 * 60 * 60 * 6, buckets: 48 },
		{ id: '24h', label: t.timeline.range24h, ms: 1000 * 60 * 60 * 24, buckets: 48 }
	];
	let rangeId = $state('6h');
	let range = $derived(ranges.find((r) => r.id === rangeId)!);

	// Feed filters.
	let sevFilter = $state<Severity | 'all'>('all');
	let kindFilter = $state<DetectionKind | 'all'>('all');
	let query = $state('');

	let hasData = $derived(known.hasData);
	let firstId = $derived(known.visibleEvents[0]?.id);

	let windowEvents = $derived(known.visibleEvents.filter((e) => e.ts >= Date.now() - range.ms));
	let alerts = $derived(known.alerts);
	let bytesInWindow = $derived(
		known.events.filter((e) => e.ts >= Date.now() - range.ms).reduce((s, e) => s + e.bytes, 0)
	);
	let activeDevices = $derived(new Set(windowEvents.map((e) => e.deviceId)).size);
	let topAlert = $derived(alerts[0]);

	function investigate() {
		if (!topAlert) return;
		query = topAlert.domain;
	}

	let filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return windowEvents.filter((e) => {
			if (sevFilter !== 'all' && e.severity !== sevFilter) return false;
			if (kindFilter !== 'all' && e.kind !== kindFilter) return false;
			if (q) {
				const dev = known.deviceById.get(e.deviceId);
				const hay = `${e.domain} ${e.ip} ${dev?.name ?? ''} ${dev?.vendor ?? ''}`.toLowerCase();
				if (!hay.includes(q)) return false;
			}
			return true;
		});
	});

	const sevs: { id: Severity | 'all'; label: string }[] = [
		{ id: 'all', label: t.feed.filterAll },
		{ id: 'alert', label: t.feed.filterAlerts },
		{ id: 'watch', label: t.feed.filterWatch },
		{ id: 'info', label: t.feed.filterInfo }
	];
</script>

<TopBar eyebrow={t.monitor.eyebrow} title={t.monitor.title} />

<section class="stats">
	<StatCard
		label={t.overview.statEvents}
		value={hasData ? windowEvents.length : '—'}
		muted={!hasData}
	/>
	<StatCard
		label={t.overview.statAlerts}
		value={hasData ? alerts.length : '—'}
		accent={alerts.length ? 'alert' : 'trust'}
		muted={!hasData}
	/>
	<StatCard
		label={t.overview.statDevices}
		value={hasData ? activeDevices : '—'}
		accent="accent"
		muted={!hasData}
	/>
	<StatCard
		label={t.overview.statTraffic}
		value={hasData ? formatBytes(bytesInWindow) : '—'}
		muted={!hasData}
	/>
</section>

<section class="panel">
	<div class="panel-head">
		<span class="eyebrow">{t.overview.trafficVolume}</span>
		<div class="seg" class:disabled={!hasData}>
			{#each ranges as r}
				<button
					class="chip"
					class:on={rangeId === r.id}
					disabled={!hasData}
					onclick={() => (rangeId = r.id)}
				>
					{r.label}
				</button>
			{/each}
		</div>
	</div>
	{#if hasData}
		<TrafficChart events={known.events} spanMs={range.ms} buckets={range.buckets} height={140} />
	{:else}
		<EmptyState
			title={t.overview.emptyTrafficTitle}
			body={t.overview.emptyTrafficBody}
			searching
		/>
	{/if}
</section>

<div class="split">
	<section class="panel feed-panel">
		<div class="panel-head feed-head">
			<span class="eyebrow">{t.overview.latestExchanges}</span>
			<div class="feed-controls">
				<div class="search" class:disabled={!hasData}>
					<input
						class="search-input"
						type="text"
						placeholder={t.feed.search}
						disabled={!hasData}
						bind:value={query}
					/>
				</div>
				<div class="chips" class:disabled={!hasData}>
					{#each sevs as s}
						<button
							class="chip"
							class:on={sevFilter === s.id}
							disabled={!hasData}
							onclick={() => (sevFilter = s.id)}
						>
							{s.label}
						</button>
					{/each}
				</div>
			</div>
		</div>
		<div class="feed">
			{#each filtered as event (event.id)}
				<EventRow {event} fresh={event.id === firstId} />
			{:else}
				<EmptyState
					title={hasData ? 'Nothing matches these filters.' : t.feed.emptyTitle}
					body={hasData ? undefined : t.feed.emptyBody}
					searching={!hasData}
					compact
				/>
			{/each}
		</div>
	</section>

	<aside class="side-col">
		<section class="panel detect-panel">
			<div class="panel-head">
				<span class="eyebrow">{t.overview.detections}</span>
			</div>
			<div class="detect-list" class:locked={!hasData}>
				{#each DETECTIONS as d}
					<div class="detect-row">
						<span class="detect-label">{t.detection[d.kind]}</span>
						<span
							class="detect-count"
							class:hot={known.countsByKind()[d.kind] > 0}
						>
							{known.countsByKind()[d.kind]}
						</span>
					</div>
				{/each}
			</div>
		</section>

		<section class="panel alert-panel" class:idle={!topAlert}>
			<span class="eyebrow alert-eyebrow">{t.overview.topAlert}</span>
			{#if topAlert}
				<p class="alert-domain">{topAlert.domain}</p>
				<p class="alert-note">{topAlert.note}</p>
				<button class="btn-investigate" onclick={investigate}>
					{t.actions.investigate}
				</button>
			{:else}
				<p class="alert-note">{known.connected ? t.overview.waitingForTraffic : t.overview.allClear}</p>
			{/if}
		</section>
	</aside>
</div>

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
		margin-top: 4px;
	}

	.panel {
		margin-top: 12px;
		background: var(--bg-card);
		border: 1px solid var(--ink-hair);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-card);
		padding: 18px 20px 20px;
	}
	.panel-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 14px;
		gap: 16px;
	}

	.seg {
		display: inline-flex;
		gap: 2px;
		padding: 3px;
		background: var(--bg-sunken);
		border-radius: var(--r-sm);
	}
	.seg.disabled,
	.chips.disabled,
	.search.disabled {
		opacity: 0.5;
	}
	.chip {
		font-size: 12px;
		font-weight: 500;
		letter-spacing: -0.005em;
		padding: 6px 12px;
		border-radius: 7px;
		background: transparent;
		color: var(--ink-soft);
		transition:
			background 0.18s var(--ease),
			color 0.18s var(--ease),
			box-shadow 0.18s var(--ease);
	}
	.chip:hover {
		color: var(--ink);
	}
	.chip:disabled {
		cursor: not-allowed;
	}
	.chip.on {
		background: var(--bg-card);
		color: var(--ink);
		box-shadow: var(--shadow-card);
	}

	.split {
		display: grid;
		grid-template-columns: 1.7fr 1fr;
		gap: 12px;
		margin-top: 12px;
		align-items: start;
	}
	.feed-panel {
		margin-top: 0;
		padding: 18px 8px 6px 8px;
	}
	.feed-head {
		padding: 0 12px;
		flex-wrap: wrap;
		gap: 12px;
	}
	.feed-controls {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
	.search {
		height: 32px;
		padding: 0 12px;
		display: flex;
		align-items: center;
		background: var(--bg-card);
		border: 1px solid var(--ink-hair);
		border-radius: var(--r-sm);
		transition: border-color 0.2s var(--ease);
	}
	.search:focus-within {
		border-color: var(--ink-faint);
	}
	.search-input {
		width: 150px;
		max-width: 40vw;
		border: none;
		background: none;
		outline: none;
		font-size: 13px;
		color: var(--ink);
	}
	.search-input:disabled {
		cursor: not-allowed;
	}
	.search-input::placeholder {
		color: var(--ink-faint);
	}
	.chips {
		display: flex;
		gap: 2px;
		padding: 3px;
		background: var(--bg-sunken);
		border-radius: var(--r-sm);
	}
	.feed {
		display: flex;
		flex-direction: column;
	}
	.feed :global(.row:last-child) {
		border-bottom: none;
	}

	.side-col {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.detect-panel,
	.alert-panel {
		margin-top: 0;
	}
	.detect-list {
		display: flex;
		flex-direction: column;
	}
	.detect-row {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 14px;
		padding: 10px 0;
		border-bottom: 1px solid var(--ink-hair);
	}
	.detect-row:last-child {
		border-bottom: none;
	}
	.detect-label {
		font-size: 13.5px;
		color: var(--ink);
	}
	.detect-count {
		font-size: 13px;
		color: var(--ink-mute);
		font-variant-numeric: tabular-nums;
	}
	.detect-count.hot {
		color: var(--ink);
		font-weight: 700;
	}
	.detect-list.locked {
		opacity: 0.55;
	}
	.detect-list.locked .detect-label {
		color: var(--ink-mute);
	}

	.alert-panel {
		display: flex;
		flex-direction: column;
		gap: 10px;
		background: var(--charcoal);
		border-color: transparent;
	}
	.alert-panel :global(.eyebrow) {
		color: var(--paper-mute);
	}
	.alert-panel :global(.eyebrow::before) {
		background: var(--paper-mute);
	}
	.alert-domain {
		font-size: 14.5px;
		font-weight: 500;
		letter-spacing: -0.01em;
		color: var(--paper);
		word-break: break-all;
	}
	.alert-note {
		font-size: 13.5px;
		line-height: 1.5;
		color: var(--paper-soft);
	}
	.alert-panel.idle {
		background: var(--bg-card);
		border: 1px solid var(--ink-hair);
		box-shadow: var(--shadow-card);
	}
	.alert-panel.idle :global(.eyebrow) {
		color: var(--ink-mute);
	}
	.alert-panel.idle .alert-note {
		color: var(--ink-soft);
	}
	.btn-investigate {
		margin-top: 4px;
		align-self: flex-start;
		height: 32px;
		padding: 0 14px;
		border-radius: var(--r-sm);
		background: var(--paper);
		color: var(--charcoal);
		font-size: 12.5px;
		font-weight: 500;
		transition:
			background 0.18s var(--ease),
			opacity 0.18s var(--ease);
	}
	.btn-investigate:hover {
		opacity: 0.9;
	}

	@media (max-width: 1100px) {
		.stats {
			grid-template-columns: repeat(2, 1fr);
		}
		.split {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 560px) {
		.stats {
			grid-template-columns: 1fr;
		}
	}
</style>
