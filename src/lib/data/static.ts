import type { Device, AllowEntry } from '$lib/types';

// DEV-ONLY MOCK DATA. Imported dynamically only when DEV_MOCK is true.
// Static detection metadata lives in ./detections.ts (not mock) -- do not move
// it back here, or importing it would drag this mock device list into the
// production bundle.

export const DEVICES: Device[] = [
	{
		id: 'dev-tv',
		name: 'Living Room TV',
		vendor: 'Samsung',
		category: 'tv',
		ip: '192.168.1.41',
		mac: '8C:79:F5:1A:22:B0',
		firstSeen: Date.now() - 1000 * 60 * 60 * 24 * 41,
		trusted: false
	},
	{
		id: 'dev-echo',
		name: 'Kitchen Speaker',
		vendor: 'Amazon',
		category: 'speaker',
		ip: '192.168.1.52',
		mac: '44:65:0D:9C:1E:7A',
		firstSeen: Date.now() - 1000 * 60 * 60 * 24 * 120,
		trusted: false
	},
	{
		id: 'dev-nest',
		name: 'Hallway Thermostat',
		vendor: 'Nest',
		category: 'thermostat',
		ip: '192.168.1.66',
		mac: '18:B4:30:55:9F:01',
		firstSeen: Date.now() - 1000 * 60 * 60 * 24 * 210,
		trusted: true
	},
	{
		id: 'dev-cam',
		name: 'Front Door Camera',
		vendor: 'Wyze',
		category: 'camera',
		ip: '192.168.1.73',
		mac: '2C:AA:8E:33:14:CD',
		firstSeen: Date.now() - 1000 * 60 * 60 * 24 * 18,
		trusted: false
	},
	{
		id: 'dev-phone',
		name: "Lorenzo's iPhone",
		vendor: 'Apple',
		category: 'phone',
		ip: '192.168.1.20',
		mac: 'F0:18:98:6B:42:9E',
		firstSeen: Date.now() - 1000 * 60 * 60 * 24 * 300,
		trusted: true
	},
	{
		id: 'dev-laptop',
		name: 'Studio MacBook',
		vendor: 'Apple',
		category: 'laptop',
		ip: '192.168.1.12',
		mac: 'A4:83:E7:0C:55:21',
		firstSeen: Date.now() - 1000 * 60 * 60 * 24 * 280,
		trusted: true
	},
	{
		id: 'dev-bulb',
		name: 'Desk Bulb',
		vendor: 'TP-Link',
		category: 'bulb',
		ip: '192.168.1.88',
		mac: '50:C7:BF:21:9A:33',
		firstSeen: Date.now() - 1000 * 60 * 60 * 24 * 9,
		trusted: false
	},
	{
		id: 'dev-plug',
		name: 'Heater Plug',
		vendor: 'Tuya',
		category: 'plug',
		ip: '192.168.1.91',
		mac: 'D8:F1:5B:74:0C:12',
		firstSeen: Date.now() - 1000 * 60 * 60 * 24 * 5,
		trusted: false
	},
	{
		id: 'dev-console',
		name: 'PlayStation 5',
		vendor: 'Sony',
		category: 'console',
		ip: '192.168.1.34',
		mac: '00:D9:D1:8E:6F:44',
		firstSeen: Date.now() - 1000 * 60 * 60 * 24 * 160,
		trusted: true
	}
];

// Per-device endpoint pools so generated traffic looks plausible. Endpoints
// marked shady tend to flag as unknown/hijack.
export interface EndpointSeed {
	domain: string;
	country: string;
	shady?: boolean;
}

export const ENDPOINTS: Record<string, EndpointSeed[]> = {
	'dev-tv': [
		{ domain: 'samsungacr.com', country: 'US' },
		{ domain: 'log-config.samsungacr.com', country: 'US' },
		{ domain: 'ads.samsungads.com', country: 'US', shady: true },
		{ domain: 'metrics.tvinteractive.tv', country: 'IE', shady: true },
		{ domain: 'cdn.samsung.com', country: 'US' }
	],
	'dev-echo': [
		{ domain: 'device-metrics-us.amazon.com', country: 'US' },
		{ domain: 'avs-alexa-na.amazon.com', country: 'US' },
		{ domain: 'unagi-na.amazon.com', country: 'US' },
		{ domain: 'd3p8zr0ffa9t17.cloudfront.net', country: 'US' }
	],
	'dev-nest': [
		{ domain: 'frontend.nest.com', country: 'US' },
		{ domain: 'weather.nest.com', country: 'US' },
		{ domain: 'time.google.com', country: 'US' }
	],
	'dev-cam': [
		{ domain: 'wyzecam.com', country: 'US' },
		{ domain: 'api.wyzecam.com', country: 'US' },
		{ domain: 'p2p-region-tx.wyzecam.com', country: 'US' },
		{ domain: 'iot-ssl-prod.wyze.tuya.com', country: 'CN', shady: true },
		{ domain: '47.88.x.x.aliyun-iot.net', country: 'CN', shady: true }
	],
	'dev-phone': [
		{ domain: 'gateway.icloud.com', country: 'US' },
		{ domain: 'gsp64-ssl.ls.apple.com', country: 'US' },
		{ domain: 'push.apple.com', country: 'US' }
	],
	'dev-laptop': [
		{ domain: 'github.com', country: 'US' },
		{ domain: 'registry.npmjs.org', country: 'US' },
		{ domain: 'swcdn.apple.com', country: 'US' },
		{ domain: 'fonts.gstatic.com', country: 'US' }
	],
	'dev-bulb': [
		{ domain: 'use1-api.tplinkra.com', country: 'US' },
		{ domain: 'n-deventry-alpha.tplinkcloud.com', country: 'US' },
		{ domain: 'telemetry.iot.tplink.com', country: 'SG', shady: true }
	],
	'dev-plug': [
		{ domain: 'a3.tuyaus.com', country: 'US' },
		{ domain: 'mq.gw.tuyaus.com', country: 'US' },
		{ domain: 'h3.iot-dns.com', country: 'CN', shady: true },
		{ domain: '198.51.x.x', country: 'CN', shady: true }
	],
	'dev-console': [
		{ domain: 'playstation.net', country: 'US' },
		{ domain: 'np.playstation.net', country: 'US' },
		{ domain: 'gs2.ww.prod.dl.playstation.net', country: 'US' }
	]
};

export const ALLOWLIST_SEED: AllowEntry[] = [
	{
		id: 'allow-apple',
		pattern: '*.apple.com',
		label: 'Apple services',
		addedTs: Date.now() - 1000 * 60 * 60 * 24 * 30
	},
	{
		id: 'allow-google-time',
		pattern: 'time.google.com',
		label: 'NTP time sync',
		addedTs: Date.now() - 1000 * 60 * 60 * 24 * 30
	},
	{
		id: 'allow-github',
		pattern: 'github.com',
		label: 'Dev work',
		addedTs: Date.now() - 1000 * 60 * 60 * 24 * 12
	},
	{
		id: 'allow-npm',
		pattern: 'registry.npmjs.org',
		label: 'Dev work',
		addedTs: Date.now() - 1000 * 60 * 60 * 24 * 12
	}
];
