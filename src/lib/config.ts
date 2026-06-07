// DEV_MOCK gates the simulated device feed (src/lib/data/*). Flip to `true`
// locally to replay mock traffic for design/QA. Production ships with this off.
// Plain const (not env var) so it tree-shakes cleanly.
export const DEV_MOCK = false;

export const STORAGE_KEYS = {
	sticker: 'known:sticker',
	LAST_KNOWN_IP: 'known_last_ip'
} as const;

// Sticker code format: KNOWN-XXXX-XXXX where X is [A-Z0-9].
export const STICKER_RE = /^KNOWN-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/**
 * Helper to decide whether to use the dev mock feed.
 * Always returns false when `connected === true` so production data wins.
 */
export function shouldUseMock(connected = false): boolean {
	return DEV_MOCK && !connected;
}
