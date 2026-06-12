<script lang="ts">
	import { page } from '$app/stores';
	import { known } from '$lib/stores/known.svelte';
	import { t } from '$lib/i18n';

	// Two surfaces: Monitor (weekly audit) and Manage (devices + allowlist).
	const links = [
		{ href: '/', label: 'Monitor', icon: 'feed' },
		{ href: '/manage', label: 'Manage', icon: 'devices' }
	];

	let alertCount = $derived(known.alerts.length);
</script>

<aside class="sidebar">
	<div class="brand">
		<span class="brand-mark">
			<img src="/favicon.png" alt="" class="brand-logo" />
		</span>
		<div class="brand-text">
			<span class="brand-name">Known</span>
			<span class="brand-sub">by Northsline</span>
		</div>
	</div>

	<nav class="nav">
		{#each links as link}
			<a
				href={link.href}
				class="nav-link"
				class:active={$page.url.pathname === link.href}
				aria-current={$page.url.pathname === link.href ? 'page' : undefined}
			>
				<span class="nav-icon" aria-hidden="true">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
						{#if link.icon === 'feed'}
							<path d="M4 6h16" />
							<path d="M4 12h16" />
							<path d="M4 18h10" />
						{:else if link.icon === 'devices'}
							<rect x="4" y="4" width="16" height="12" rx="2" />
							<path d="M8 20h8" />
							<path d="M12 16v4" />
						{/if}
					</svg>
				</span>
				<span class="nav-label">{link.label}</span>
				{#if link.href === '/' && alertCount > 0}
					<span class="nav-badge">{alertCount}</span>
				{/if}
			</a>
		{/each}
	</nav>

	<div class="sidebar-foot">
		<p class="foot-note">{t.footer.tagline}</p>
	</div>
</aside>

<style>
	.sidebar {
		width: var(--sidebar-w);
		flex-shrink: 0;
		height: 100vh;
		position: sticky;
		top: 0;
		display: flex;
		flex-direction: column;
		padding: 30px 18px 22px;
		background: var(--paper);
		border-right: 1px solid var(--ink-hair);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 2px 6px 26px;
	}
	.brand-mark {
		width: 40px;
		height: 40px;
		flex-shrink: 0;
		border-radius: 11px;
		background: var(--charcoal);
		display: grid;
		place-items: center;
	}
	.brand-logo {
		width: 22px;
		height: 22px;
		border-radius: 6px;
		display: block;
	}
	.brand-text {
		display: flex;
		flex-direction: column;
		line-height: 1.15;
	}
	.brand-name {
		font-family: 'Instrument Sans', sans-serif;
		font-weight: 600;
		font-size: 16px;
		letter-spacing: -0.02em;
	}
	.brand-sub {
		font-family: 'Instrument Sans', sans-serif;
		font-size: 11px;
		letter-spacing: 0.01em;
		color: var(--ink-mute);
	}

	.nav {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
	}
	.nav-link {
		display: flex;
		align-items: center;
		gap: 11px;
		padding: 9px 12px;
		border-radius: var(--r-sm);
		border: 1px solid transparent;
		color: var(--ink-soft);
		transition:
			border-color 0.18s var(--ease),
			color 0.18s var(--ease);
	}
	.nav-link:hover {
		border-color: var(--charcoal);
		color: var(--ink);
	}
	.nav-link:focus-visible {
		border-color: var(--charcoal);
		color: var(--ink);
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	.nav-link.active {
		border-color: var(--charcoal);
		color: var(--ink);
	}
	.nav-icon {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
		color: var(--ink-faint);
	}
	.nav-icon svg {
		width: 100%;
		height: 100%;
	}
	.nav-link:hover .nav-icon,
	.nav-link.active .nav-icon {
		color: var(--ink);
	}
	.nav-label {
		font-family: 'Instrument Sans', sans-serif;
		font-size: 14px;
		font-weight: 500;
		letter-spacing: -0.01em;
		flex: 1;
	}
	.nav-badge {
		font-size: 11px;
		font-weight: 600;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		border-radius: var(--r-pill);
		display: grid;
		place-items: center;
		background: var(--alert-soft);
		color: var(--alert);
	}

	.sidebar-foot {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-top: 16px;
		border-top: 1px solid var(--ink-hair);
	}

	.foot-note {
		font-size: 11.5px;
		line-height: 1.4;
		color: var(--ink-mute);
	}

	@media (max-width: 880px) {
		.sidebar {
			width: 100%;
			height: auto;
			position: static;
			flex-direction: row;
			align-items: center;
			padding: 14px 18px;
			gap: 16px;
			border-right: none;
			border-bottom: 1px solid var(--ink-hair);
			overflow-x: auto;
		}
		.brand {
			padding: 0;
		}
		.brand-text {
			display: none;
		}
		.nav {
			flex-direction: row;
			flex: 1;
			gap: 4px;
		}
		.nav-link {
			padding: 8px 12px;
			white-space: nowrap;
		}
		.sidebar-foot {
			border-top: none;
			padding-top: 0;
		}
		.foot-note {
			display: none;
		}
	}
</style>
