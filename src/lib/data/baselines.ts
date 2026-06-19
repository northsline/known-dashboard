import type { DeviceCategory } from '$lib/types';

// Per-device-category baseline descriptions. These are static metadata, not
// mock data — safe to import in production paths. They power the "should I
// worry?" traffic light by giving the user context for what's normal.
//
// The copy is deliberately plain-language. A user seeing "47 ad domains" needs
// to know whether that's alarming or just Tuesday for a smart TV.
//
// reduceHint stays generic — "check the device settings for ad tracking" —
// not a specific menu path. One Samsung firmware update would break a
// per-device instruction library. These are evergreen categories.

export interface CategoryBaseline {
	category: DeviceCategory;
	// Short label for what this device type typically does on the network.
	normal: string;
	// Generic action category — never a specific menu path.
	reduceHint?: string;
}

export const BASELINES: Record<DeviceCategory, CategoryBaseline> = {
	tv: {
		category: 'tv',
		normal: 'Smart TVs contact ad and analytics servers constantly. 20-60 ad domains per day is typical.',
		reduceHint: 'Check your TV settings for ad tracking or smart features and turn off what you don\'t use.'
	},
	speaker: {
		category: 'speaker',
		normal: 'Smart speakers check in with cloud services whenever active. A few dozen connections per hour while in use is normal.',
		reduceHint: 'Check the speaker app for privacy settings and turn off voice recording if you don\'t use it.'
	},
	thermostat: {
		category: 'thermostat',
		normal: 'Thermostats talk to weather and time servers. Very low traffic, a few connections per hour.'
	},
	camera: {
		category: 'camera',
		normal: 'Cameras stream to cloud endpoints. Traffic is steady but moderate. Be alert if it contacts servers outside the vendor domain.',
		reduceHint: 'Check if the camera app offers local recording instead of cloud.'
	},
	phone: {
		category: 'phone',
		normal: 'Phones make hundreds of DNS queries per hour when in use — push notifications, app sync, location. This is normal.'
	},
	laptop: {
		category: 'laptop',
		normal: 'Laptops generate the most varied traffic on your network. High query count is expected during active use.'
	},
	bulb: {
		category: 'bulb',
		normal: 'Smart bulbs check in with cloud servers a few times per hour. Very low traffic.',
		reduceHint: 'Some bulbs support a local-only mode — check the manufacturer app.'
	},
	plug: {
		category: 'plug',
		normal: 'Smart plugs send small telemetry pings. A few connections per hour is normal. Be alert if it contacts servers outside the vendor.',
		reduceHint: 'Some plugs work offline after setup — check the manual.'
	},
	console: {
		category: 'console',
		normal: 'Game consoles contact matchmaking, CDN, and telemetry servers during use. High traffic while gaming is expected.'
	},
	hub: {
		category: 'hub',
		normal: 'Smart home hubs relay traffic for connected devices. Moderate, steady traffic is normal.'
	},
	unknown: {
		category: 'unknown',
		normal: 'No baseline data for this device type yet. Pay attention to where it connects.'
	}
};