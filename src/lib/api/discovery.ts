import { STORAGE_KEYS } from '../config';

export function normalizeToBase(originOrIp: string): string | null {
	let base = originOrIp.trim();
	if (!base) return null;
	if (!/^https?:\/\//i.test(base)) base = `http://${base}`;
	try {
		const url = new URL(base);
		if (!url.port) {
			return `${url.protocol}//${url.hostname}:8080`;
		}
		return `${url.protocol}//${url.hostname}:${url.port}`;
	} catch {
		return null;
	}
}

async function checkHealth(base: string, timeoutMs = 2000): Promise<boolean> {
	try {
		const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(timeoutMs) });
		return res.ok;
	} catch {
		return false;
	}
}

function rememberBase(base: string): void {
	try {
		localStorage.setItem(STORAGE_KEYS.LAST_KNOWN_IP, base);
	} catch {
		// ignore storage errors
	}
}

/** Try known.local, then the last saved IP. Returns a working base URL or null. */
export async function discoverPico(): Promise<string | null> {
	const mdnsBase = 'http://known.local:8080';

	if (await checkHealth(mdnsBase)) {
		rememberBase(mdnsBase);
		return mdnsBase;
	}

	try {
		const saved = localStorage.getItem(STORAGE_KEYS.LAST_KNOWN_IP);
		if (!saved) return null;

		const base = normalizeToBase(saved);
		if (!base) return null;

		if (await checkHealth(base)) return base;
	} catch {
		// ignore storage errors
	}

	return null;
}

/** Probe a user-supplied host/IP and persist it when healthy. */
export async function connectToManualIp(originOrIp: string): Promise<string | null> {
	const base = normalizeToBase(originOrIp);
	if (!base) return null;
	if (!(await checkHealth(base))) return null;
	rememberBase(base);
	return base;
}
