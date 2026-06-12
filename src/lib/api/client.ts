import type { NetEvent, Device, AllowEntry, Stats } from '$lib/types';
import { discoverPico } from './discovery';
import { STORAGE_KEYS } from '$lib/config';
import {
	adaptDevices,
	adaptEvents,
	adaptAllowlist,
	buildSourceIpToDeviceIdMap
} from './adapters';

export interface KnownClientEvents {
	onConnectionChange?: (connected: boolean) => void;
	onEvent?: (event: NetEvent) => void;
}

export class KnownClient {
	connected = false;
	#baseUrl: string | null = null;
	#cachedDevices: Device[] | null = null;

	#handlers: KnownClientEvents;

	constructor(handlers: KnownClientEvents = {}) {
		this.#handlers = handlers;
	}

	async connect(manualBase?: string | null): Promise<boolean> {
		this.connected = false;
		this.#handlers.onConnectionChange?.(false);

		const base = manualBase ?? (await discoverPico());
		if (!base) return false;

		try {
			const res = await fetch(`${base}/health`);
			if (!res.ok) return false;
		} catch (err) {
			console.error('KnownClient.connect: health check failed', err);
			return false;
		}

		this.#baseUrl = base;
		try {
			localStorage.setItem(STORAGE_KEYS.LAST_KNOWN_IP, base);
		} catch {
			// ignore storage errors
		}

		this.connected = true;
		this.#handlers.onConnectionChange?.(true);
		return true;
	}

	get baseUrl(): string | null {
		return this.#baseUrl;
	}

	async disconnect(): Promise<void> {
		this.connected = false;
		this.#handlers.onConnectionChange?.(false);
		this.#baseUrl = null;
	}

	private url(path: string): string | null {
		if (!this.#baseUrl) return null;
		try {
			return new URL(path, this.#baseUrl).toString();
		} catch (e) {
			console.error('KnownClient.url: invalid path', path, e);
			return null;
		}
	}

	async fetchWeeklyAudit(since?: number, limit?: number): Promise<NetEvent[]> {
		const u = this.url('/audit/weekly');
		if (!u) return [];
		try {
			const url = new URL(u);
			if (since) url.searchParams.set('since', String(since));
			if (limit) url.searchParams.set('limit', String(limit));
			const res = await fetch(url.toString());
			if (!res.ok) {
				console.error('fetchWeeklyAudit: bad response', res.status);
				return [];
			}
			const fwData = await res.json();
			const ipMap = buildSourceIpToDeviceIdMap(this.#cachedDevices ?? []);
			return adaptEvents(fwData, ipMap);
		} catch (err) {
			console.error('fetchWeeklyAudit error', err);
			return [];
		}
	}

	async fetchDevices(): Promise<Device[]> {
		const u = this.url('/devices');
		if (!u) return [];
		try {
			const res = await fetch(u);
			if (!res.ok) {
				console.error('fetchDevices: bad response', res.status);
				return [];
			}
			const fwData = await res.json();
			const adapted = adaptDevices(fwData);
			this.#cachedDevices = adapted;
			return adapted;
		} catch (err) {
			console.error('fetchDevices error', err);
			return [];
		}
	}

	async fetchAllowlist(): Promise<AllowEntry[]> {
		const u = this.url('/allowlist');
		if (!u) return [];
		try {
			const res = await fetch(u);
			if (!res.ok) {
				console.error('fetchAllowlist: bad response', res.status);
				return [];
			}
			const fwData = await res.json();
			return adaptAllowlist(fwData);
		} catch (err) {
			console.error('fetchAllowlist error', err);
			return [];
		}
	}

	async fetchStats(): Promise<Stats | null> {
		const u = this.url('/stats');
		if (!u) return null;
		try {
			const res = await fetch(u);
			if (!res.ok) {
				console.error('fetchStats: bad response', res.status);
				return null;
			}
			const data = await res.json();
			return (data as Stats) ?? null;
		} catch (err) {
			console.error('fetchStats error', err);
			return null;
		}
	}

	async putAllow(entry: AllowEntry): Promise<string | null> {
		const u = this.url('/allowlist');
		if (!u) return null;
		try {
			const res = await fetch(u, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pattern: entry.pattern })
			});
			if (!res.ok) {
				console.error('putAllow: bad response', res.status);
				return null;
			}
			try {
				const json = await res.json();
				return (json && (json.id as string)) ?? null;
			} catch {
				return null;
			}
		} catch (err) {
			console.error('putAllow error', err);
		}
		return null;
	}

	async deleteAllow(id: string): Promise<void> {
		const u = this.url(`/allowlist/${encodeURIComponent(id)}`);
		if (!u) return;
		try {
			await fetch(u, { method: 'DELETE' });
		} catch (err) {
			console.error('deleteAllow error', err);
		}
	}
}
