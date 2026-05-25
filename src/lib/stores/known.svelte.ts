import type { NetEvent, AllowEntry, Device, DetectionKind } from '$lib/types';
import { KnownClient } from '$lib/api/client';
import { DEV_MOCK, STORAGE_KEYS, STICKER_RE } from '$lib/config';

const MAX_EVENTS = 1200;

// Glob match for allowlist patterns like "*.apple.com" or "github.com".
function patternMatches(pattern: string, domain: string): boolean {
	if (pattern === domain) return true;
	if (pattern.startsWith('*.')) {
		const base = pattern.slice(2);
		return domain === base || domain.endsWith('.' + base);
	}
	return false;
}

class KnownStore {
	stickerCode = $state<string | null>(null);
	onboarded = $state(false);

	// Production defaults: no device, no data. The app stays in searching state
	// until the real client connects.
	connected = $state(false);
	connecting = $state(false);
	paused = $state(false);
	events = $state<NetEvent[]>([]);
	devices = $state<Device[]>([]);
	allowlist = $state<AllowEntry[]>([]);
	selectedDeviceId = $state<string | null>(null);
	deviceOverrides = $state<Record<string, boolean>>({}); // id -> trusted

	#client: KnownClient | null = null;
	#timer: ReturnType<typeof setTimeout> | null = null;

	constructor() {
		this.#restoreSticker();
	}

	#restoreSticker() {
		if (typeof localStorage === 'undefined') return;
		const stored = localStorage.getItem(STORAGE_KEYS.sticker);
		if (stored && STICKER_RE.test(stored)) {
			this.stickerCode = stored;
			this.onboarded = true;
		}
	}

	isValidCode(code: string): boolean {
		return STICKER_RE.test(code.trim().toUpperCase());
	}

	submitCode(code: string, remember = true): boolean {
		const clean = code.trim().toUpperCase();
		if (!STICKER_RE.test(clean)) return false;
		this.stickerCode = clean;
		this.onboarded = true;
		if (remember && typeof localStorage !== 'undefined') {
			localStorage.setItem(STORAGE_KEYS.sticker, clean);
		}
		this.start();
		return true;
	}

	resetDevice() {
		this.stop();
		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem(STORAGE_KEYS.sticker);
		}
		this.stickerCode = null;
		this.onboarded = false;
		this.connected = false;
		this.events = [];
		this.devices = [];
		this.allowlist = [];
	}

	// An event is "suppressed" when its domain is on the allowlist.
	isAllowed(domain: string): boolean {
		return this.allowlist.some((a) => patternMatches(a.pattern, domain));
	}

	isTrusted(deviceId: string): boolean {
		if (deviceId in this.deviceOverrides) return this.deviceOverrides[deviceId];
		return this.devices.find((d) => d.id === deviceId)?.trusted ?? false;
	}

	get visibleEvents(): NetEvent[] {
		// Newest first, allowlisted events excluded.
		return [...this.events].filter((e) => !this.isAllowed(e.domain)).sort((a, b) => b.ts - a.ts);
	}

	get alerts(): NetEvent[] {
		return this.visibleEvents.filter((e) => e.severity === 'alert');
	}

	get hasData(): boolean {
		return this.events.length > 0;
	}

	get deviceById(): Map<string, Device> {
		return new Map(this.devices.map((d) => [d.id, d]));
	}

	countsByKind(): Record<DetectionKind, number> {
		const base: Record<DetectionKind, number> = {
			'new-connection': 0,
			'data-spike': 0,
			'unknown-endpoint': 0,
			'night-activity': 0,
			'dns-hijack': 0
		};
		for (const e of this.visibleEvents) base[e.kind] += 1;
		return base;
	}

	eventsForDevice(id: string): NetEvent[] {
		return this.visibleEvents.filter((e) => e.deviceId === id);
	}

	bytesForDevice(id: string): number {
		return this.events.filter((e) => e.deviceId === id).reduce((sum, e) => sum + e.bytes, 0);
	}

	/**
	 * Begin discovery. Instantiates the device client (once) and attempts to
	 * connect. In production connect() returns false so the app stays searching.
	 * Under DEV_MOCK the simulated feed runs instead.
	 */
	async start() {
		if (!this.onboarded || !this.stickerCode) return;

		if (DEV_MOCK) {
			this.#startMock();
			return;
		}

		if (!this.#client) {
			this.#client = new KnownClient(this.stickerCode, {
				onConnectionChange: (c) => (this.connected = c),
				onEvent: (e) => this.push(e)
			});
		}
		await this.discover();
	}

	async discover(): Promise<boolean> {
		if (DEV_MOCK || !this.#client) return this.connected;
		this.connecting = true;
		try {
			const ok = await this.#client.connect();
			this.connected = ok;
			if (ok) {
					this.events = await this.#client.fetchWeeklyAudit();
				this.devices = await this.#client.fetchDevices();
				this.allowlist = await this.#client.fetchAllowlist();
			}
			return ok;
		} finally {
			this.connecting = false;
		}
	}

	stop() {
		if (this.#timer) {
			clearTimeout(this.#timer);
			this.#timer = null;
		}
		this.#client?.disconnect();
	}

	push(e: NetEvent) {
		const next = [...this.events, e];
		if (next.length > MAX_EVENTS) next.splice(0, next.length - MAX_EVENTS);
		this.events = next;
	}

	togglePause() {
		if (!this.connected) return;
		this.paused = !this.paused;
	}

	setTrusted(deviceId: string, trusted: boolean) {
		this.deviceOverrides = { ...this.deviceOverrides, [deviceId]: trusted };
	}

	addAllow(pattern: string, label: string) {
		const clean = pattern.trim().toLowerCase();
		if (!clean) return;
		if (this.allowlist.some((a) => a.pattern === clean)) return;
		const entry: AllowEntry = {
			id: `allow-${Date.now().toString(36)}`,
			pattern: clean,
			label: label.trim() || '—',
			addedTs: Date.now()
		};
		this.allowlist = [entry, ...this.allowlist];
		if (this.connected) this.#client?.putAllow(entry);
	}

	removeAllow(id: string) {
		this.allowlist = this.allowlist.filter((a) => a.id !== id);
		if (this.connected) this.#client?.deleteAllow(id);
	}

	exportJSON(): string {
		return JSON.stringify(
			{
				exported: new Date().toISOString(),
				device: this.stickerCode ?? 'known-local',
				events: this.visibleEvents
			},
			null,
			2
		);
	}

	// DEV-only simulated feed, tree-shaken when DEV_MOCK is false.
	async #startMock() {
		if (this.#timer) return;
		const [{ makeEvent, seedHistory }, { DEVICES, ALLOWLIST_SEED }] = await Promise.all([
			import('$lib/data/generate'),
			import('$lib/data/static')
		]);
		this.devices = DEVICES;
		this.allowlist = [...ALLOWLIST_SEED];
		this.events = seedHistory();
		this.connected = true;
		const tick = () => {
			if (this.connected && !this.paused) this.push(makeEvent());
			this.#timer = setTimeout(tick, 1400 + Math.random() * 2600);
		};
		this.#timer = setTimeout(tick, 1200);
	}
}

export const known = new KnownStore();
