/**
 * Data transformation layer - adapts firmware MVP responses to dashboard types.
 *
 * The Pico firmware returns a minimal data format suitable for embedded constraints.
 * This module transforms that compact format into the rich types the dashboard
 * components expect, filling in sensible defaults for MVP-missing fields.
 *
 * This adapter makes the dashboard compatible with both:
 * - The current firmware MVP (minimal fields)
 * - Future firmware versions (with richer data)
 *
 * See /resources/private docs/product-context.md section 3.5 for details on MVP limitations.
 */

import type { Device, NetEvent, AllowEntry } from '$lib/types';

/**
 * Generate a stable event ID from source, domain, and timestamp.
 * Used because the firmware doesn't provide explicit event IDs in the MVP.
 */
function generateEventId(source: string, domain: string, timestamp: number): string {
	// Create a simple but stable hash
	const key = `${source}|${domain}|${Math.floor(timestamp)}`;
	let hash = 0;
	for (let i = 0; i < key.length; i++) {
		const char = key.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}
	return `evt-${Math.abs(hash).toString(36)}`;
}

/**
 * Transform a firmware device response into a dashboard Device.
 *
 * Firmware provides: id, ip, name, first_seen, last_seen, trust_level, query_count, flagged_count
 * Dashboard expects: id, name, vendor, category, ip, mac, firstSeen, trusted
 *
 * MVP limitations:
 * - vendor: not available (will be added when firmware does OUI lookup)
 * - category: not available (will be added when firmware detects device types)
 * - mac: not available (will be added with ARP table tracking)
 * - trusted: use false as default (user can override per-session)
 */
export function adaptDevice(fwDevice: Record<string, any>): Device {
	return {
		id: String(fwDevice.id ?? 'unknown'),
		name: String(fwDevice.name ?? `Device at ${fwDevice.ip ?? 'unknown'}`),
		vendor: 'Unknown', // MVP: not available from firmware
		category: 'unknown', // MVP: not available from firmware
		ip: String(fwDevice.ip ?? '0.0.0.0'),
		mac: '??:??:??:??:??:??', // MVP: not available from firmware
		firstSeen: Math.floor((fwDevice.first_seen ?? 0) * 1000), // Convert seconds to ms
		trusted: false // MVP: always false; user can override per-session
	};
}

/**
 * Transform a firmware audit event into a dashboard NetEvent.
 *
 * Firmware provides: source, domain, timestamp, flagged
 * Dashboard expects: id, ts, deviceId, domain, ip, country, bytes, kind, severity, encrypted, note
 *
 * MVP limitations:
 * - id: generated from source+domain+timestamp hash
 * - ts: timestamp converted from seconds to ms
 * - deviceId: mapped from source IP using provided deviceIdMap (or "unknown")
 * - ip: resolved endpoint IP not available; use placeholder
 * - country: geolocation not available; use placeholder
 * - bytes: payload size not available; use 0
 * - kind: detection type not available; default to "new-connection"
 * - severity: always "info" (heuristics not implemented in firmware MVP)
 * - encrypted: TLS detection not available; default to false
 * - note: use placeholder
 */
export function adaptEvent(
	fwEvent: Record<string, any>,
	sourceIpToDeviceId: Map<string, string>
): NetEvent {
	const source = String(fwEvent.source ?? '0.0.0.0');
	const domain = String(fwEvent.domain ?? '');
	const timestamp = Number(fwEvent.timestamp ?? 0);

	// Map source IP to device ID; if not in map, we couldn't identify the device
	const deviceId = sourceIpToDeviceId.get(source) ?? 'unknown';

	return {
		id: generateEventId(source, domain, timestamp),
		ts: Math.floor(timestamp * 1000), // Convert epoch seconds to milliseconds
		deviceId, // Mapped from source IP
		domain,
		ip: '0.0.0.0', // MVP: resolved endpoint IP not available
		country: '??', // MVP: geolocation not available
		bytes: 0, // MVP: payload size not available
		kind: 'new-connection', // MVP: heuristics not implemented
		severity: 'info', // MVP: always "info" in firmware
		encrypted: false, // MVP: TLS detection not available
		note: '' // MVP: no explanatory notes in firmware
	};
}

/**
 * Build a source IP → device ID mapping from a devices list.
 * Used to correlate audit events (which have source IP) to devices (which have ID).
 */
export function buildSourceIpToDeviceIdMap(devices: Device[]): Map<string, string> {
	const map = new Map<string, string>();
	for (const device of devices) {
		map.set(device.ip, device.id);
	}
	return map;
}

/**
 * Transform an array of firmware device responses.
 */
export function adaptDevices(fwDevices: any[]): Device[] {
	return Array.isArray(fwDevices) ? fwDevices.map(adaptDevice) : [];
}

/**
 * Transform an array of firmware audit events.
 * Must be called after devices are fetched so we can map source IPs to device IDs.
 */
export function adaptEvents(
	fwEvents: any[],
	sourceIpToDeviceId: Map<string, string>
): NetEvent[] {
	return Array.isArray(fwEvents) ? fwEvents.map((evt) => adaptEvent(evt, sourceIpToDeviceId)) : [];
}

/**
 * Transform allowlist entries (should already be in correct format from firmware, but normalize).
 */
export function adaptAllowlist(fwEntries: any[]): AllowEntry[] {
	if (!Array.isArray(fwEntries)) return [];
	return fwEntries.map((entry) => ({
		id: String(entry.id ?? ''),
		pattern: String(entry.pattern ?? ''),
		label: '', // Firmware doesn't provide labels; dashboard can add locally
		addedTs: Math.floor((entry.created_at ?? 0) * 1000) // Convert to ms
	}));
}
