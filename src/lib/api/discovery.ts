import { STORAGE_KEYS } from '../config';

function storageKey(): string {
	// If `LAST_KNOWN_IP` isn't added to STORAGE_KEYS yet, fall back to a reasonable default.
 	// This keeps discovery working before config.ts is updated in a subsequent step.
 	return (STORAGE_KEYS as any).LAST_KNOWN_IP ?? 'known_last_ip';
}

function normalizeToBase(originOrIp: string): string | null {
 	let base = originOrIp.trim();
 	if (!/^https?:\/\//i.test(base)) base = `http://${base}`;
 	try {
 		const url = new URL(base);
 		if (!url.port) {
 			return `${url.protocol}//${url.hostname}:8080`;
 		}
 		return `${url.protocol}//${url.hostname}:${url.port}`;
 	} catch (e) {
 		console.error('discoverPico: invalid URL', originOrIp, e);
 		return null;
 	}
}

export async function discoverPico(): Promise<string | null> {
 	const mdnsBase = 'http://known.local:8080';

 	// Try mDNS-known hostname first with a short timeout.
 	try {
 		const res = await fetch(`${mdnsBase}/health`, { signal: AbortSignal.timeout(2000) });
 		if (res.ok) {
 			try {
 				localStorage.setItem(storageKey(), mdnsBase);
 			} catch {}
 			return mdnsBase;
 		}
 	} catch (err) {
 		console.error('discoverPico: known.local check failed', err);
 	}

 	// Fallback: check last-known IP in localStorage.
 	try {
 		const key = storageKey();
 		const saved = localStorage.getItem(key);
 		if (!saved) return null;

 		const base = normalizeToBase(saved);
 		if (!base) return null;

 		try {
 			const res2 = await fetch(`${base}/health`, { signal: AbortSignal.timeout(2000) });
 			if (res2.ok) return base;
 		} catch (err) {
 			console.error('discoverPico: saved IP check failed', err);
 		}
 	} catch (err) {
 		console.error('discoverPico: localStorage fallback failed', err);
 	}

 	return null;
}

