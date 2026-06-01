<script lang="ts">
	import { known } from '$lib/stores/known.svelte';
	import { t } from '$lib/i18n';

	// Lightweight first-launch screen: the device is already provisioned (via the
	// onboarding PWA). The dashboard just needs the sticker code to identify which
	// Known to talk to. One field, validate format, save, then start discovery.
	let code = $state('');
	let error = $state('');

	function submit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		if (!known.submitCode(code)) {
			error = t.gate.invalid;
		}
	}
</script>

<div class="gate" role="dialog" aria-modal="true" aria-labelledby="gate-title">
	<div class="gate-grain" aria-hidden="true"></div>

	<div class="gate-inner">
		<img src="/favicon.png" alt="" class="gate-mark" aria-hidden="true" />

		<div class="gate-head">
			<h1 class="gate-title" id="gate-title">{t.gate.title}</h1>
			<p class="gate-sub">{t.gate.body}</p>
		</div>

		<form class="panel" onsubmit={submit}>
			<label class="field">
				<span class="field-label">{t.gate.codeLabel}</span>
				<input
					class="field-input mono"
					type="text"
					bind:value={code}
					placeholder="KNOWN-XXXX-XXXX"
					autocomplete="off"
					autocapitalize="characters"
					spellcheck="false"
					required
				/>
			</label>
			<button class="gate-submit" type="submit" disabled={!code.trim()}>
				{t.gate.confirmBtn}
			</button>
			<p class="gate-error" role="alert" aria-live="assertive">{error}</p>
			<p class="gate-hint">{t.gate.hint}</p>
		</form>
	</div>
</div>

<style>
	.gate {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: grid;
		place-items: center;
		padding: 32px;
		background: var(--charcoal);
		color: var(--paper);
		overflow: hidden;
		animation: gateIn 0.6s var(--ease-out) both;
	}
	@keyframes gateIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.gate-grain {
		position: absolute;
		inset: 0;
		background: radial-gradient(120% 90% at 50% 0%, rgba(255, 255, 255, 0.05), transparent 60%);
		pointer-events: none;
	}

	.gate-inner {
		position: relative;
		width: 100%;
		max-width: 420px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 28px;
		text-align: center;
	}

	.gate-mark {
		width: 52px;
		height: 52px;
		border-radius: 14px;
		display: block;
	}

	.gate-head {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.gate-title {
		font-family: 'Instrument Sans', sans-serif;
		font-weight: 500;
		font-size: clamp(28px, 5vw, 36px);
		letter-spacing: -0.03em;
		line-height: 1.05;
		color: var(--paper);
	}
	.gate-sub {
		font-size: 15px;
		line-height: 1.5;
		color: var(--paper-soft);
	}

	.panel {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 14px;
		width: 100%;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 7px;
		text-align: left;
	}
	.field-label {
		font-size: 12.5px;
		color: var(--paper-soft);
	}
	.field-input {
		height: 48px;
		padding: 0 14px;
		color: var(--paper);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: var(--r-sm);
		outline: none;
		font-size: 15px;
		letter-spacing: 0.08em;
		transition:
			border-color 0.18s var(--ease),
			background 0.18s var(--ease),
			box-shadow 0.18s var(--ease);
	}
	.field-input::placeholder {
		color: var(--paper-mute);
		letter-spacing: 0.08em;
	}
	.field-input:focus {
		border-color: var(--paper-soft);
		background: rgba(255, 255, 255, 0.09);
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.08);
	}

	.gate-error {
		min-height: 18px;
		font-size: 12.5px;
		line-height: 1.4;
		color: oklch(0.74 0.13 25);
	}

	.gate-submit {
		width: 100%;
		height: 48px;
		border-radius: var(--r-sm);
		background: var(--paper);
		color: var(--ink);
		font-weight: 600;
		font-size: 15px;
		letter-spacing: -0.01em;
		transition:
			opacity 0.2s var(--ease),
			transform 0.15s var(--ease);
	}
	.gate-submit:hover {
		opacity: 0.88;
	}
	.gate-submit:active {
		transform: scale(0.99);
	}
	.gate-submit:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.gate-hint {
		font-size: 12px;
		line-height: 1.5;
		color: var(--paper-mute);
	}
</style>
