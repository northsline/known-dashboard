<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { known } from '$lib/stores/known.svelte';
	import { timeAgo } from '$lib/utils';
	import { t } from '$lib/i18n';

	let pattern = $state('');
	let label = $state('');

	// Count how many captured events each rule is currently suppressing.
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

<TopBar eyebrow={t.allowlist.eyebrow} title={t.allowlist.title} />

<p class="lead">{t.allowlist.lead}</p>

<div class="layout">
	<form class="add-card" onsubmit={submit}>
		<span class="eyebrow">{t.allowlist.addRule}</span>
		<div class="field">
			<label class="field-label mono" for="pattern">{t.allowlist.fieldPattern}</label>
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
			<label class="field-label mono" for="label">{t.allowlist.fieldLabel}</label>
			<input
				id="label"
				class="field-input"
				type="text"
				placeholder={t.allowlist.labelPlaceholder}
				bind:value={label}
			/>
		</div>
		<button class="btn-primary" type="submit">{t.actions.addToAllowlist}</button>
		<p class="add-hint mono">{@html t.allowlist.hint}</p>
	</form>

	<div class="rules">
		<div class="rules-head">
			<span class="eyebrow">{t.allowlist.activeRules}</span>
			<span class="rules-count mono">{known.allowlist.length} {t.allowlist.entries}</span>
		</div>

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
							<span class="rule-stat mono">{suppressedBy(rule.pattern)} {t.allowlist.hidden}</span>
							<span class="rule-added mono">{t.allowlist.added} {timeAgo(rule.addedTs)}</span>
						</div>
						<button class="rule-remove mono" onclick={() => known.removeAllow(rule.id)}>
							{t.actions.remove}
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.lead {
		margin: 24px 0 28px;
		max-width: 70ch;
		font-size: 16px;
		line-height: 1.6;
		color: var(--ink-soft);
	}
	.layout {
		display: grid;
		grid-template-columns: 360px 1fr;
		gap: 20px;
		align-items: start;
	}

	.add-card {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 26px 26px 28px;
		background: var(--bg-card);
		border: 1px solid var(--ink-hair);
		border-radius: var(--r-lg);
		box-shadow: var(--shadow-card);
		position: sticky;
		top: 24px;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 7px;
	}
	.field-label {
		font-size: 10px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}
	.field-input {
		height: 44px;
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
		font-size: 11px;
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
		border-radius: var(--r-lg);
		box-shadow: var(--shadow-card);
		padding: 22px 24px 8px;
	}
	.rules-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 8px;
	}
	.rules-count {
		font-size: 11px;
		color: var(--ink-mute);
		letter-spacing: 0.06em;
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
		padding: 18px 0;
		border-bottom: 1px solid var(--ink-hair);
		transition: padding 0.25s var(--ease);
	}
	.rule:last-child {
		border-bottom: none;
	}
	.rule:hover {
		padding-left: 8px;
	}
	.rule-main {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}
	.rule-pattern {
		font-size: 14px;
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
		gap: 4px;
		text-align: right;
	}
	.rule-stat {
		font-size: 11px;
		color: var(--ink-soft);
		letter-spacing: 0.04em;
	}
	.rule-added {
		font-size: 10px;
		color: var(--ink-mute);
		letter-spacing: 0.04em;
	}
	.rule-remove {
		font-size: 10.5px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
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

	@media (max-width: 900px) {
		.layout {
			grid-template-columns: 1fr;
		}
		.add-card {
			position: static;
		}
	}
	@media (max-width: 560px) {
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
