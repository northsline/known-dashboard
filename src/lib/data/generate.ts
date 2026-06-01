import type { NetEvent, DetectionKind, Severity } from '$lib/types';
import { DEVICES, ENDPOINTS, type EndpointSeed } from './static';

// Simple random helpers for plausible, varied mock traffic.
function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function randBytes(spike: boolean): number {
	if (spike) return 8_000_000 + Math.floor(Math.random() * 60_000_000);
	return 200 + Math.floor(Math.random() * 40_000);
}

let seq = 0;
function nextId(): string {
	seq += 1;
	return `evt-${seq.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function fakeIp(seed: EndpointSeed): string {
	if (/\d+\.\d+\.x\.x/.test(seed.domain) || /^\d/.test(seed.domain)) {
		return seed.domain.replace(/x/g, () => String(Math.floor(Math.random() * 254) + 1));
	}
	const a = seed.country === 'CN' ? 47 : seed.country === 'IE' ? 34 : seed.country === 'SG' ? 13 : 52;
	return `${a}.${rand(255)}.${rand(255)}.${rand(254) + 1}`;
}

function rand(n: number): number {
	return Math.floor(Math.random() * n);
}

function isNight(ts: number): boolean {
	const h = new Date(ts).getHours();
	return h >= 1 && h <= 5;
}

// Decide what kind of detection (if any) an exchange represents, and how
// severe it is. Trusted devices hitting known-shady endpoints still flag;
// that's the point of the product.
function classify(
	seed: EndpointSeed,
	firstContact: boolean,
	bytes: number,
	ts: number
): { kind: DetectionKind; severity: Severity; note: string } {
	if (seed.shady && /dns|resolver|iot-dns/.test(seed.domain)) {
		return {
			kind: 'dns-hijack',
			severity: 'alert',
			note: 'Resolution pointed at a non-configured resolver.'
		};
	}
	if (seed.shady) {
		return {
			kind: 'unknown-endpoint',
			severity: 'alert',
			note: `Endpoint outside the safe list (${seed.country}).`
		};
	}
	if (bytes > 8_000_000) {
		return {
			kind: 'data-spike',
			severity: 'watch',
			note: `Unusually large upload (${formatBytes(bytes)}).`
		};
	}
	if (isNight(ts)) {
		return {
			kind: 'night-activity',
			severity: 'watch',
			note: 'Activity during quiet hours (01:00–05:00).'
		};
	}
	if (firstContact) {
		return {
			kind: 'new-connection',
			severity: 'info',
			note: 'First time this device has reached this host.'
		};
	}
	return { kind: 'new-connection', severity: 'info', note: 'Routine exchange.' };
}

export function formatBytes(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} MB`;
	if (n >= 1000) return `${(n / 1000).toFixed(1)} KB`;
	return `${n} B`;
}

// Track which (device, domain) pairs we've seen so "new-connection" means
// something across the session.
const seenPairs = new Set<string>();

export function makeEvent(at: number = Date.now()): NetEvent {
	const device = pick(DEVICES);
	const pool = ENDPOINTS[device.id] ?? [{ domain: 'unknown.local', country: 'XX' }];
	const seed = pick(pool);

	const pairKey = `${device.id}|${seed.domain}`;
	const firstContact = !seenPairs.has(pairKey);
	seenPairs.add(pairKey);

	const spike = Math.random() < 0.08;
	const bytes = randBytes(spike);
	const { kind, severity, note } = classify(seed, firstContact, bytes, at);

	return {
		id: nextId(),
		ts: at,
		deviceId: device.id,
		domain: seed.domain,
		ip: fakeIp(seed),
		country: seed.country,
		bytes,
		kind,
		severity,
		encrypted: !seed.shady && Math.random() > 0.15,
		note
	};
}

// Build a backfilled history so the timeline isn't empty on first load.
// Spreads `count` events across the trailing `spanMs` window.
export function seedHistory(count = 220, spanMs = 1000 * 60 * 60 * 6): NetEvent[] {
	const now = Date.now();
	const events: NetEvent[] = [];
	for (let i = 0; i < count; i++) {
		const ts = now - Math.floor((spanMs * (count - i)) / count) + rand(20_000);
		events.push(makeEvent(ts));
	}
	return events.sort((a, b) => a.ts - b.ts);
}
