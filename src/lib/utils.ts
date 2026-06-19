import type { Severity, DeviceCategory, DetectionKind, NetEvent, Device, WorryAssessment, WorryLevel } from '$lib/types';
import { BASELINES } from '$lib/data/baselines';

export function timeAgo(ts: number, now: number = Date.now()): string {
	const s = Math.max(0, Math.floor((now - ts) / 1000));
	if (s < 5) return 'now';
	if (s < 60) return `${s}s ago`;
	const m = Math.floor(s / 60);
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.floor(h / 24)}d ago`;
}

export function formatBytes(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} MB`;
	if (n >= 1000) return `${(n / 1000).toFixed(1)} KB`;
	return `${n} B`;
}

export function clockTime(ts: number): string {
	return new Date(ts).toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	});
}

export function severityColor(s: Severity): string {
	switch (s) {
		case 'alert':
			return 'var(--alert)';
		case 'watch':
			return 'var(--accent)';
		default:
			return 'var(--trust)';
	}
}

export function severityLabel(s: Severity): string {
	switch (s) {
		case 'alert':
			return 'Alert';
		case 'watch':
			return 'Watch';
		default:
			return 'Info';
	}
}

// Unicode glyphs per device category, no icon font needed.
export function deviceGlyph(cat: DeviceCategory): string {
	const map: Record<DeviceCategory, string> = {
		tv: '▢',
		speaker: '◉',
		thermostat: '◐',
		camera: '⬡',
		phone: '▯',
		laptop: '▭',
		bulb: '✺',
		plug: '⏚',
		console: '◊',
		hub: '⬢',
		unknown: '?'
	};
	return map[cat] ?? '?';
}

export function detectionLabel(k: DetectionKind): string {
	const map: Record<DetectionKind, string> = {
		'new-connection': 'New connection',
		'data-spike': 'Data spike',
		'unknown-endpoint': 'Unknown endpoint',
		'night-activity': 'Night activity',
		'dns-hijack': 'DNS hijack'
	};
	return map[k];
}

export function download(filename: string, content: string, mime = 'application/json') {
	const blob = new Blob([content], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

// "Should I worry?" — turns a device + its events into a plain-language
// traffic-light assessment. This is the core of the passive-only positioning:
// Known doesn't block, but it tells you whether what you see is normal or not.
export function assessWorry(device: Device, events: NetEvent[]): WorryAssessment {
	const baseline = BASELINES[device.category];
	const alertCount = events.filter((e) => e.severity === 'alert').length;
	const watchCount = events.filter((e) => e.severity === 'watch').length;

	if (events.length === 0) {
		return {
			level: 'clear',
			headline: 'No traffic from this device yet.',
			detail: 'Known will show you what it talks to as soon as it connects.'
		};
	}

	if (alertCount > 0) {
		const top = events.find((e) => e.severity === 'alert');
		return {
			level: 'alert',
			headline: `${alertCount} alert${alertCount > 1 ? 's' : ''} on this device.`,
			detail: top?.note ?? 'Traffic going to unexpected endpoints.',
			hint: baseline.reduceHint
		};
	}

	if (watchCount > 0) {
		return {
			level: 'watch',
			headline: `Something unusual on this device.`,
			detail: `${watchCount} event${watchCount > 1 ? 's' : ''} worth looking into — ${baseline.normal.toLowerCase()}`,
			hint: baseline.reduceHint
		};
	}

	return {
		level: 'normal',
		headline: 'Looks normal.',
		detail: baseline.normal
	};
}

export function worryColor(level: WorryLevel): string {
	switch (level) {
		case 'alert':
			return 'var(--alert)';
		case 'watch':
			return 'var(--accent)';
		case 'normal':
			return 'var(--trust)';
		default:
			return 'var(--ink-faint)';
	}
}
