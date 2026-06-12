import type { NetEvent, AllowEntry, Device, DetectionKind } from '$lib/types';
import { KnownClient } from '$lib/api/client';
import { connectToManualIp } from '$lib/api/discovery';
import { shouldUseMock } from '$lib/config';

const MAX_EVENTS = 1200;

function patternMatches(pattern: string, domain: string): boolean {
	if (pattern === domain) return true;
	if (pattern.startsWith('*.')) {
		const base = pattern.slice(2);
		return domain === base || domain.endsWith('.' + base);
	}
	return false;
}

class KnownStore {
	connected = $state(false);
	connecting = $state(false);
	discoveryAttempted = $state(false);
	paused = $state(false);
	events = $state<NetEvent[]>([]);
	devices = $state<Device[]>([]);
	deviceUrl = $state<string | null>(null);
	allowlist = $state<AllowEntry[]>([]);
	selectedDeviceId = $state<string | null>(null);
	deviceOverrides = $state<Record<string, boolean>>({});

	#client: KnownClient | null = null;
	#timer: ReturnType<typeof setTimeout> | null = null;

	isAllowed(domain: string): boolean {
		return this.allowlist.some((a) => patternMatches(a.pattern, domain));
	}

	isTrusted(deviceId: string): boolean {
		if (deviceId in this.deviceOverrides) return this.deviceOverrides[deviceId];
		return this.devices.find((d) => d.id === deviceId)?.trusted ?? false;
	}

	get visibleEvents(): NetEvent[] {
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

	async start() {
		if (shouldUseMock(this.connected)) {
			this.#startMock();
			return;
		}

		if (!this.#client) {
			this.#client = new KnownClient({
				onConnectionChange: (c) => (this.connected = c),
				onEvent: (e) => this.push(e)
			});
		}
		await this.discover();
	}

	async discover(): Promise<boolean> {
		if (shouldUseMock(this.connected)) return this.connected;
		if (!this.#client) {
			this.#client = new KnownClient({
				onConnectionChange: (c) => (this.connected = c),
				onEvent: (e) => this.push(e)
			});
		}

		this.connecting = true;
		try {
			const ok = await this.#client.connect();
			this.connected = ok;
			this.discoveryAttempted = true;
			if (ok) {
				this.deviceUrl = this.#client.baseUrl ?? null;
				this.devices = await this.#client.fetchDevices();
				this.events = await this.#client.fetchWeeklyAudit();
				this.allowlist = await this.#client.fetchAllowlist();
			}
			return ok;
		} finally {
			this.connecting = false;
		}
	}

	async connectManualIp(originOrIp: string): Promise<boolean> {
		if (shouldUseMock(this.connected)) return this.connected;

		if (!this.#client) {
			this.#client = new KnownClient({
				onConnectionChange: (c) => (this.connected = c),
				onEvent: (e) => this.push(e)
			});
		}

		this.connecting = true;
		try {
			const base = await connectToManualIp(originOrIp);
			if (!base) {
				this.connected = false;
				this.discoveryAttempted = true;
				return false;
			}

			const ok = await this.#client.connect(base);
			this.connected = ok;
			this.discoveryAttempted = true;
			if (ok) {
				this.deviceUrl = this.#client.baseUrl ?? null;
				this.devices = await this.#client.fetchDevices();
				this.events = await this.#client.fetchWeeklyAudit();
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
		this.deviceUrl = null;
		this.connected = false;
	}

	async connect(): Promise<boolean> {
		return await this.discover();
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
		if (this.connected) {
			this.#client?.putAllow(entry).then((serverId) => {
				if (serverId) {
					this.allowlist = this.allowlist.map((a) => (a === entry ? { ...a, id: serverId } : a));
				}
			});
		}
	}

	removeAllow(id: string) {
		this.allowlist = this.allowlist.filter((a) => a.id !== id);
		if (this.connected) this.#client?.deleteAllow(id);
	}

	exportJSON(): string {
		return JSON.stringify(
			{
				exported: new Date().toISOString(),
				device: this.deviceUrl ?? 'known-local',
				events: this.visibleEvents
			},
			null,
			2
		);
	}

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
		this.discoveryAttempted = true;
		const tick = () => {
			if (this.connected && !this.paused) this.push(makeEvent());
			this.#timer = setTimeout(tick, 1400 + Math.random() * 2600);
		};
		this.#timer = setTimeout(tick, 1200);
	}
}

export const known = new KnownStore();
