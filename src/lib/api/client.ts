import type { NetEvent, Device, AllowEntry } from '$lib/types';

export interface KnownClientEvents {
	onConnectionChange?: (connected: boolean) => void;
	onEvent?: (event: NetEvent) => void;
}

export class KnownClient {
	readonly stickerCode: string;
	connected = false;

	#handlers: KnownClientEvents;

	constructor(code: string, handlers: KnownClientEvents = {}) {
		this.stickerCode = code;
		this.#handlers = handlers;
	}

	/**
	 * Discover and connect to the Known device on the local network.
	 * TODO: real mDNS discovery (known.local) + weekly-audit fetch.
	 * Returns false for now -- there is no device to find.
	 */
	async connect(): Promise<boolean> {
		this.connected = false;
		this.#handlers.onConnectionChange?.(false);
		return false;
	}

	async disconnect(): Promise<void> {
		this.connected = false;
		this.#handlers.onConnectionChange?.(false);
	}


	async fetchWeeklyAudit(): Promise<NetEvent[]> {
		return [];
	}

	async fetchDevices(): Promise<Device[]> {
		return [];
	}

	async fetchAllowlist(): Promise<AllowEntry[]> {
		return [];
	}

	async putAllow(_entry: AllowEntry): Promise<void> {
		// TODO: PUT /allowlist on the device.
	}

	async deleteAllow(_id: string): Promise<void> {
		// TODO: DELETE /allowlist/:id on the device.
	}
}
