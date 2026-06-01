// DEV_MOCK gates the simulated device feed (src/lib/data/*). Flip to `true`
// locally to replay mock traffic for design/QA. Production ships with this off.
// Plain const (not env var) so it tree-shakes cleanly.
export const DEV_MOCK = false;

export const STORAGE_KEYS = {
	sticker: 'known:sticker'
} as const;

// Sticker code format: KNOWN-XXXX-XXXX where X is [A-Z0-9].
export const STICKER_RE = /^KNOWN-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
