// Domain types for the Known dashboard.
// These mirror what the device would expose over the local network so the
// mock layer can be swapped for a real client without touching components.

export type DetectionKind =
	| 'new-connection'
	| 'data-spike'
	| 'unknown-endpoint'
	| 'night-activity'
	| 'dns-hijack';

export type Severity = 'info' | 'watch' | 'alert';

export type DeviceCategory =
	| 'tv'
	| 'speaker'
	| 'thermostat'
	| 'camera'
	| 'phone'
	| 'laptop'
	| 'bulb'
	| 'plug'
	| 'console'
	| 'hub'
	| 'unknown';

export interface Device {
	id: string;
	name: string;
	vendor: string;
	category: DeviceCategory;
	ip: string;
	mac: string;
	firstSeen: number; // epoch ms
	trusted: boolean;
}

export interface NetEvent {
	id: string;
	ts: number; // epoch ms
	deviceId: string;
	domain: string; // DNS name the device resolved / contacted
	ip: string; // resolved endpoint
	country: string; // ISO-ish label for the endpoint
	bytes: number; // payload size for this exchange
	kind: DetectionKind;
	severity: Severity;
	encrypted: boolean;
	note: string;
}

export interface AllowEntry {
	id: string;
	pattern: string; // domain or domain glob
	label: string;
	addedTs: number;
}

export interface Stats {
	totalEvents: number;
	trafficBytes: number;
	devices: number;
	alerts: number;
}

export interface DetectionMeta {
	kind: DetectionKind;
	num: string; // "01".."05"
	label: string;
	blurb: string;
}

// "Should I worry?" traffic light system.
// Turns raw event data into a plain-language assessment so users know
// whether what they see is normal for this device type or worth acting on.
export type WorryLevel = 'clear' | 'normal' | 'watch' | 'alert';

export interface WorryAssessment {
	level: WorryLevel;
	headline: string; // "Your Samsung TV looks normal"
	detail: string; // "47 connections to ad domains — typical for smart TVs"
	hint?: string; // optional: "You can reduce this in TV settings > Ad Tracking"
}
