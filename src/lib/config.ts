// DEV_MOCK gates the simulated device feed (src/lib/data/*). Flip to `true`
// locally to replay mock traffic for design/QA. Production ships with this off.
// Plain const (not env var) so it tree-shakes cleanly.
export const DEV_MOCK = false;

export const STORAGE_KEYS = {
	sticker: 'known:sticker'
} as const;

// Sticker code format: KNOWN-XXXX-XXXX where X is [A-Z0-9].
export const STICKER_RE = /^KNOWN-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

// USB WebSerial provisioning. The PWA talks to the Pico over a
// CDC/ACM serial port at 115200 baud. WebSerial is Chrome/Edge only.
export const SERIAL_BAUD = 115200;

// Raspberry Pi Pico 2 W presents as a Raspberry Pi USB CDC device.
// 0x2e8a = Raspberry Pi vendor ID; the filter narrows the browser port picker.
export const SERIAL_FILTERS: SerialPortFilter[] = [{ usbVendorId: 0x2e8a }];

// Cloud activation backend (device registry). Overridable per-environment via
// VITE_API_BASE_URL; defaults to the local dev server.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
