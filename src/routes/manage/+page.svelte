<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import DeviceCard from '$lib/components/DeviceCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { known } from '$lib/stores/known.svelte';
	import { timeAgo } from '$lib/utils';
	import { t } from '$lib/i18n';

	type Filter = 'all' | 'watched' | 'trusted' | 'flagged';
	let filter = $state<Filter>('all');

	let hasDevices = $derived(known.devices.length > 0);

	let devices = $derived.by(() => {
		return known.devices.filter((d) => {
			const trusted = known.isTrusted(d.id);
			const flagged = known.eventsForDevice(d.id).some((e) => e.severity === 'alert');
			if (filter === 'trusted') return trusted;
			if (filter === 'watched') return !trusted;
			if (filter === 'flagged') return flagged;
			return true;
		});
	});

	const filters: { id: Filter; label: string }[] = [
		{ id: 'all', label: t.devices.filterAll },
		{ id: 'flagged', label: t.devices.filterFlagged },
		{ id: 'watched', label: t.devices.filterWatched },
		{ id: 'trusted', label: t.devices.filterTrusted }
	];

	// Allowlist form.
	let pattern = $state('');
	let label = $state('');

	function suppressedBy(p: string): number {
		const match = (domain: string) => {
			if (p === domain) return true;
			if (p.startsWith('*.')) {
				const base = p.slice(2);
				return domain === base || domain.endsWith('.' + base);
			}
			return false;
		};
		return known.events.filter((e) => match(e.domain)).length;
	}

	function submit(e: SubmitEvent) {
		e.preventDefault();
		known.addAllow(pattern, label);
		pattern = '';
		label = '';
	}
</script>

<TopBar eyebrow={t.manage.eyebrow} title={t.manage.title} />

<section class="block">
	<div class="block-head">
		<span class="eyebrow">{t.devices.eyebrow}</span>
		<div class="seg" class:disabled={!hasDevices} role="group" aria-label={t.devices.eyebrow}>
			{#each filters as f}
				<button
					class="chip"
					class:on={filter === f.id}
					disabled={!hasDevices}
					onclick={() => (filter = f.id)}
					aria-pressed={filter === f.id}
				>
					{f.label}
				</button>
			{/each}
		</div>
		{#if hasDevices}
			<span class="head-count">{devices.length} {t.devices.shown}</span>
		{/if}
	</div>

	{#if !hasDevices}
		<div class="surface empty-wrap">
			<EmptyState title={t.devices.emptyTitle} body={t.devices.emptyBody} searching />
			<p class="empty-help">
				{t.actions.needHelp}
				<a
					class="setup-link"
					href="https://known.setup"
					target="_blank"
					rel="noopener noreferrer"
				>
					{t.actions.openSetup} {t.connection.setupLink}
				</a>
			</p>
		</div>
	{:else}
		<div class="grid">
			{#each devices as device (device.id)}
				<DeviceCard {device} />
			{/each}
		</div>
	{/if}
</section>

<section class="block">
	<div class="block-head">
		<span class="eyebrow">{t.allowlist.eyebrow}</span>
		<span class="head-count">{known.allowlist.length} {t.allowlist.entries}</span>
	</div>

	<div class="layout">
		<form class="add-card" onsubmit={submit}>
			<div class="field">
				<label class="field-label" for="pattern">{t.allowlist.fieldPattern}</label>
				<input
					id="pattern"
					class="field-input mono"
					type="text"
					placeholder={t.allowlist.patternPlaceholder}
					bind:value={pattern}
					required
				/>
			</div>
			<div class="field">
				<label class="field-label" for="label">{t.allowlist.fieldLabel}</label>
				<input
					id="label"
					class="field-input"
					type="text"
					placeholder={t.allowlist.labelPlaceholder}
					bind:value={label}
				/>
			</div>
			<button class="btn-primary" type="submit">{t.actions.addToAllowlist}</button>
			<p class="add-hint">
				Use
				<button
					type="button"
					class="hint-chip"
					onclick={() => (pattern = t.allowlist.hintChip)}
				>
					{t.allowlist.hintChip}
				</button>
				for subdomains, or type an exact host.
			</p>
		</form>

		<div class="rules">
			{#if known.allowlist.length === 0}
				<EmptyState title={t.allowlist.emptyTitle} body={t.allowlist.emptyBody} compact />
			{:else}
				<div class="rule-list">
					{#each known.allowlist as rule (rule.id)}
						<div class="rule">
							<div class="rule-main">
								<span class="rule-pattern mono">{rule.pattern}</span>
								<span class="rule-label">{rule.label}</span>
							</div>
							<div class="rule-meta">
								<span class="rule-stat">{suppressedBy(rule.pattern)} {t.allowlist.hidden}</span>
								<span class="rule-added">{t.allowlist.added} {timeAgo(rule.addedTs)}</span>
							</div>
							<button class="rule-remove" onclick={() => known.removeAllow(rule.id)}>
								{t.actions.remove}
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.block {
		margin-top: 22px;
	}
	.block-head {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 14px;
		flex-wrap: wrap;
	}
	.head-count {
		margin-left: auto;
		font-size: 11.5px;
		color: var(--ink-mute);
	}

	.seg {
		display: inline-flex;
		gap: 2px;
		padding: 3px;
		background: var(--bg-sunken);
		border-radius: var(--r-sm);
	}
	.seg.disabled {
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

	.empty-wrap {
		padding: 20px;
	}
	.empty-help {
		text-align: center;
		font-size: 13px;
		color: var(--ink-mute);
		margin-top: 10px;
	}
	.setup-link {
		color: var(--accent);
		font-weight: 500;
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.setup-link:hover {
		color: oklch(0.48 0.1 248);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}

	.layout {
		display: grid;
		grid-template-columns: 320px 1fr;
		gap: 12px;
		align-items: start;
	}
	.add-card {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 18px 20px 20px;
		background: var(--bg-card);
		border: 1px solid var(--ink-hair);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-card);
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.field-label {
		font-size: 12px;
		font-weight: 500;
		color: var(--ink-mute);
	}
	.field-input {
		height: 40px;
		padding: 0 14px;
		border-radius: var(--r-sm);
		border: 1px solid var(--ink-hair);
		background: var(--bg-sunken);
		font-size: 14px;
		color: var(--ink);
		outline: none;
		transition:
			border-color 0.2s var(--ease),
			background 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
	}
	.field-input:focus {
		background: var(--bg-card);
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}
	.field-input::placeholder {
		color: var(--ink-faint);
	}
	.add-hint {
		font-size: 11.5px;
		line-height: 1.5;
		color: var(--ink-mute);
	}
	.add-hint :global(code) {
		background: var(--bg-sunken);
		padding: 1px 5px;
		border-radius: 4px;
		color: var(--ink-soft);
	}

	.rules {
		background: var(--bg-card);
		border: 1px solid var(--ink-hair);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-card);
		padding: 8px 20px;
	}
	.rule-list {
		display: flex;
		flex-direction: column;
	}
	.rule {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: 18px;
		padding: 14px 0;
		border-bottom: 1px solid var(--ink-hair);
	}
	.rule:last-child {
		border-bottom: none;
	}
	.rule-main {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}
	.rule-pattern {
		font-size: 13.5px;
		color: var(--ink);
		word-break: break-all;
	}
	.rule-label {
		font-size: 12.5px;
		color: var(--ink-soft);
	}
	.rule-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 3px;
		text-align: right;
	}
	.rule-stat {
		font-size: 11.5px;
		color: var(--ink-soft);
	}
	.rule-added {
		font-size: 11px;
		color: var(--ink-mute);
	}
	.rule-remove {
		font-size: 12px;
		font-weight: 500;
		color: var(--ink-mute);
		padding: 6px 12px;
		border-radius: var(--r-pill);
		border: 1px solid var(--ink-hair);
		transition:
			color 0.2s var(--ease),
			background 0.2s var(--ease),
			border-color 0.2s var(--ease);
	}
	.rule-remove:hover {
		color: var(--alert);
		border-color: oklch(0.58 0.16 25 / 0.32);
		background: var(--alert-soft);
	}

	@media (max-width: 1100px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 900px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 640px) {
		.grid {
			grid-template-columns: 1fr;
		}
		.rule {
			grid-template-columns: 1fr auto;
			gap: 10px;
		}
		.rule-meta {
			grid-column: 1 / -1;
			flex-direction: row;
			align-items: center;
			justify-content: flex-start;
			gap: 14px;
		}
	}
</style>
