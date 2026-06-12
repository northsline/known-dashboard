<script lang="ts">
	import { known } from '$lib/stores/known.svelte';
	import { t } from '$lib/i18n';

	const STORAGE_KEY = 'known-manual-ip';

	let manualIp = $state('');
	let manualError = $state('');
	let manualBusy = $state(false);
	let showTooltip = $state(false);

	// Load saved IP from localStorage on mount
	$effect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) manualIp = saved;
		} catch {
			// localStorage not available
		}
	});

	// Has this user ever successfully connected?
	let hasEverConnected = $derived.by(() => {
		if (known.deviceUrl) return true;
		if (known.events.length > 0) return true;
		try {
			if (localStorage.getItem(STORAGE_KEY)) return true;
		} catch {
			// localStorage not available
		}
		return false;
	});

	// Extract a friendly device name from URL or IP
	function getDeviceName(url: string | null): string {
		if (!url) return 'your Known';
		// If it's an IP, just say "Known"
		if (/^\d+\.\d+\.\d+\.\d+/.test(url)) return 'Known';
		// Otherwise show the host (without http://)
		return url.replace(/^https?:\/\//, '').replace(/:.*/, '');
	}

	let status = $derived.by(() => {
		if (known.connected) return 'connected' as const;
		if (known.connecting) return 'searching' as const;
		return 'offline' as const;
	});

	let showManual = $derived(!known.connected && !known.connecting && known.discoveryAttempted);
	let deviceName = $derived(getDeviceName(known.deviceUrl));

	// Validate IPv4 format
	function isValidIpv4(ip: string): boolean {
		const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
		if (!ipv4Regex.test(ip)) return false;
		const parts = ip.split('.').map(Number);
		return parts.every((p) => p >= 0 && p <= 255);
	}

	// Validate hostname (simple check)
	function isValidHost(host: string): boolean {
		if (isValidIpv4(host)) return true;
		// Allow local hostnames like "known.local" or "raspberrypi.local"
		const hostRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]*$/;
		return hostRegex.test(host);
	}

	async function submitManual(e: SubmitEvent) {
		e.preventDefault();
		manualError = '';
		const input = manualIp.trim();
		if (!input) return;

		// Validate input
		if (!isValidHost(input)) {
			manualError = t.connection.manualInvalidFormat;
			return;
		}

		manualBusy = true;
		try {
			const ok = await known.connectManualIp(input);
			if (ok) {
				// Save to localStorage on success
				try {
					localStorage.setItem(STORAGE_KEY, input);
				} catch {
					// localStorage not available
				}
			} else {
				manualError = t.connection.manualInvalid;
			}
		} finally {
			manualBusy = false;
		}
	}

	function forgetSavedIp() {
		try {
			localStorage.removeItem(STORAGE_KEY);
			manualIp = '';
		} catch {
			// localStorage not available
		}
	}
</script>

<div class="banner banner-{status}" role="status" aria-live="polite">
	<span class="banner-dot" class:searching={status === 'searching'}></span>
	<div class="banner-body">
		{#if status === 'connected'}
			<span class="banner-text">
				{t.connection.connected}
				<span class="banner-url-wrap">
					<span
						class="banner-url"
						onmouseenter={() => (showTooltip = true)}
						onmouseleave={() => (showTooltip = false)}
						onfocus={() => (showTooltip = true)}
						onblur={() => (showTooltip = false)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								showTooltip = !showTooltip;
							}
						}}
						tabindex="0"
						role="button"
						aria-label={deviceName}
					>
						({deviceName})
					</span>
					{#if showTooltip}
						<span class="url-tooltip" role="tooltip">
							{t.connection.urlTooltip}
						</span>
					{/if}
				</span>
			</span>
		{:else if status === 'searching'}
			<span class="banner-text">{t.connection.searching}</span>
		{:else}
			{#if hasEverConnected}
				<span class="banner-text">{t.connection.bannerOffline}</span>
			{:else}
				<span class="banner-text banner-text-never">
					{t.connection.bannerOfflineNever}
					<a
						class="setup-link"
						href="https://known.setup"
						target="_blank"
						rel="noopener noreferrer"
					>
						{t.connection.setupLink}
					</a>
				</span>
			{/if}
			{#if showManual}
				<form class="manual-form" onsubmit={submitManual}>
					<label class="manual-label" for="manual-ip">{t.connection.manualLabel}</label>
					<div class="manual-row">
						<input
							id="manual-ip"
							class="manual-input"
							type="text"
							bind:value={manualIp}
							placeholder={t.connection.manualPlaceholder}
							autocomplete="off"
							spellcheck="false"
						/>
						<button class="manual-btn" type="submit" disabled={manualBusy || !manualIp.trim()}>
							{manualBusy ? t.connection.manualConnecting : t.connection.manualConnect}
						</button>
					</div>
					{#if manualError}
						<p class="manual-error">{manualError}</p>
					{/if}
					{#if manualIp && !manualError}
						<button type="button" class="forget-btn" onclick={forgetSavedIp}>
							{t.connection.forgetIp}
						</button>
					{/if}
				</form>
			{/if}
		{/if}
	</div>
</div>

<style>
	.banner {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		margin-top: 16px;
		padding: 11px 16px;
		border-radius: var(--r-md);
		font-size: 13px;
		line-height: 1.4;
	}
	.banner-connected {
		background: oklch(0.94 0.04 145);
		border: 1px solid oklch(0.72 0.1 145 / 0.35);
		color: oklch(0.35 0.06 145);
	}
	.banner-searching {
		background: var(--warn-soft);
		border: 1px solid oklch(0.72 0.11 70 / 0.28);
		color: var(--ink-soft);
	}
	.banner-offline {
		background: oklch(0.95 0.03 25);
		border: 1px solid oklch(0.72 0.12 25 / 0.28);
		color: var(--ink-soft);
	}
	.banner-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
		margin-top: 5px;
	}
	.banner-connected .banner-dot {
		background: oklch(0.55 0.14 145);
	}
	.banner-searching .banner-dot {
		background: var(--warn);
	}
	.banner-offline .banner-dot {
		background: oklch(0.58 0.16 25);
	}
	.banner-dot.searching {
		animation: pulse 1.4s ease-in-out infinite;
	}
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.35;
		}
	}
	.banner-body {
		min-width: 0;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.banner-text {
		min-width: 0;
	}
	.banner-text-never {
		line-height: 1.55;
	}
	.banner-url-wrap {
		position: relative;
		display: inline;
	}
	.banner-url {
		color: inherit;
		opacity: 0.75;
		cursor: help;
		border-bottom: 1px dashed oklch(0.55 0.14 145 / 0.4);
	}
	.url-tooltip {
		position: absolute;
		left: 50%;
		bottom: calc(100% + 6px);
		transform: translateX(-50%);
		white-space: nowrap;
		padding: 5px 10px;
		background: var(--charcoal);
		color: var(--paper-soft);
		font-size: 11.5px;
		border-radius: var(--r-sm);
		box-shadow: var(--shadow-pop);
		pointer-events: none;
		z-index: 10;
		animation: tooltipIn 0.15s var(--ease-out);
	}
	.url-tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 5px solid transparent;
		border-top-color: var(--charcoal);
	}
	@keyframes tooltipIn {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(3px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}
	.setup-link {
		color: oklch(0.55 0.14 145);
		font-weight: 500;
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.setup-link:hover {
		color: oklch(0.4 0.1 145);
	}
	.manual-form {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.manual-label {
		font-size: 12px;
		color: inherit;
		opacity: 0.85;
	}
	.manual-row {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.manual-input {
		flex: 1;
		min-width: 160px;
		height: 34px;
		padding: 0 10px;
		border: 1px solid oklch(0.72 0.12 25 / 0.25);
		border-radius: var(--r-sm);
		background: var(--bg-card);
		color: var(--ink);
		font-size: 13px;
		outline: none;
	}
	.manual-input:focus {
		border-color: var(--ink-faint);
	}
	.manual-btn {
		height: 34px;
		padding: 0 14px;
		border-radius: var(--r-sm);
		background: var(--charcoal);
		color: var(--paper);
		font-size: 13px;
		font-weight: 500;
		white-space: nowrap;
	}
	.manual-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.manual-error {
		font-size: 12px;
		color: oklch(0.48 0.14 25);
	}
	.forget-btn {
		background: none;
		border: none;
		color: oklch(0.55 0.14 145);
		font-size: 12px;
		cursor: pointer;
		padding: 0;
		text-decoration: underline;
		opacity: 0.8;
	}
	.forget-btn:hover {
		opacity: 1;
	}
</style>
