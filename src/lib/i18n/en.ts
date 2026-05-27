// English strings, the canonical dictionary. Its shape is the `Dict` type.
// v1 is English-only; add a second locale by satisfying `Dict` and registering
// it in index.ts. Grouped by surface.

export const en = {
	locale: 'en',

	app: {
		title: 'Known: Network Privacy Dashboard',
		brand: 'Known',
		brandBy: 'by Northsline'
	},

	onboarding: {
		welcome: 'Set up your Known.',
		subhead: 'Plug your Known into this computer with the USB cable to begin.',
		codeLabel: 'Device code',
		remember: 'Remember this device',
		invalid: 'Code not recognized. Check the sticker on your Known.',
		hint: 'Setup uses your USB port. Chrome or Edge required.',

		// USB WebSerial provisioning flow
		unsupported:
			'This browser can’t set up Known. Open this page in Chrome or Edge, which support WebSerial.',
		stepConnectTitle: 'Connect your Known',
		stepConnectBody: 'Plug Known into this computer with the USB cable, then connect.',
		connectBtn: 'Connect device',
		connecting: 'Connecting…',
		stepConfirmTitle: 'Confirm your device',
		stepConfirmBody: 'We read this code from your Known. Check it matches the sticker.',
		confirmBtn: 'This is my code',
		stepWifiTitle: 'Add your Wi-Fi',
		stepWifiBody: 'Known joins this network once it’s unplugged from your PC.',
		wifiSsid: 'Network name (SSID)',
		wifiPass: 'Wi-Fi password',
		activateBtn: 'Activate & save',
		activating: 'Activating…',
		provisioning: 'Saving to device…',
		stepDoneTitle: 'You’re ready.',
		stepDoneBody:
			'Unplug Known from your PC and plug it into the wall adapter. It will connect on its own.',
		doneBtn: 'Open dashboard',
		errActivate: 'We couldn’t activate this code. It may already be claimed.',
		errProvision: 'We couldn’t save the settings to your device. Reconnect and try again.',
		errNoCode: 'Your Known didn’t report a code. Reconnect and try again.'
	},

	connection: {
		searching: 'Searching for Known…',
		connected: 'Connected',
		offline: 'Not detected',
		paused: 'Paused',
		linkedTo: 'known.local',
		bannerOffline:
			'Known is not detected. Check that your device is powered on and on the same Wi-Fi network.'
	},

	actions: {
		pause: 'Pause',
		resume: 'Resume',
		connect: 'Connect',
		disconnect: 'Disconnect',
		exportJson: 'Export JSON',
		resetDevice: 'Reset device',
		investigate: 'Investigate',
		openFeed: 'Open weekly audit',
		addToAllowlist: 'Add to allowlist',
		remove: 'Remove'
	},

	monitor: {
		eyebrow: 'Monitor',
		title: 'Your network, <em>this week.</em>'
	},

	manage: {
		eyebrow: 'Manage',
		title: 'Devices and <em>what you trust.</em>'
	},

	overview: {
		eyebrow: 'Overview',
		title: 'Network activity, <em>this week.</em>',
		statEvents: 'Events / window',
		statAlerts: 'Open alerts',
		statDevices: 'Active devices',
		statTraffic: 'Traffic seen',
		trafficVolume: 'Traffic volume',
		latestExchanges: 'Recent exchanges',
		detections: 'Detections',
		topAlert: 'Top alert',
		allClear: 'All clear. Waiting for your device.',
		emptyTrafficTitle: 'No traffic yet.',
		emptyTrafficBody: "Connect your Known device to see what's on your network.",
		emptyEvents: 'No events captured.'
	},

	devices: {
		eyebrow: 'Devices',
		title: 'Everything connected <em>to your network.</em>',
		shown: 'shown',
		filterAll: 'All',
		filterFlagged: 'Flagged',
		filterWatched: 'Watched',
		filterTrusted: 'Trusted',
		emptyTitle: 'No devices yet.',
		emptyBody: 'Make sure your Known device is on and connected to your network.'
	},

	feed: {
		eyebrow: 'Weekly audit',
		title: 'Network conversations, <em>over the past week.</em>',
		search: 'filter by domain, ip, device…',
		filterAll: 'All',
		filterAlerts: 'Alerts',
		filterWatch: 'Watch',
		filterInfo: 'Info',
		allDetections: 'All detections',
		streaming: 'weekly audit',
		matching: 'matching events',
		emptyTitle: 'No audit yet.',
		emptyBody: 'Your weekly audit will appear here once your device is connected.'
	},

	timeline: {
		eyebrow: 'Timeline',
		title: 'Rewind and review <em>your day.</em>',
		range1h: '1 hour',
		range6h: '6 hours',
		range24h: '24 hours',
		events: 'events',
		alerts: 'alerts',
		ago: 'ago',
		now: 'now',
		notableMoments: 'Notable moments',
		notableSub: 'flagged exchanges in window',
		emptyTitle: 'No notable events yet.',
		emptyBody: 'Flagged exchanges will appear here once your device is connected.'
	},

	allowlist: {
		eyebrow: 'Allowlist',
		title: "Hide <em>what you've approved.</em>",
		lead: 'Rules stay on your device. Anything on this list is hidden from your feed, but still recorded, so you can review it anytime. Build it as you go.',
		addRule: 'Add rule',
		fieldPattern: 'Domain or glob',
		fieldLabel: 'Label',
		patternPlaceholder: '*.apple.com',
		labelPlaceholder: 'why you trust it',
		hint: 'Use <code>*.domain.com</code> for subdomains, or type an exact host.',
		activeRules: 'Active rules',
		entries: 'entries',
		hidden: 'hidden',
		added: 'added',
		emptyTitle: 'No rules yet.',
		emptyBody: 'Add rules as you find traffic you trust. You can add them anytime.'
	},

	detection: {
		'new-connection': 'New connection',
		'data-spike': 'Data spike',
		'unknown-endpoint': 'Unknown endpoint',
		'night-activity': 'Night activity',
		'dns-hijack': 'DNS hijack'
	},

	footer: {
		tagline: 'Runs on your device. Nothing leaves.'
	}
} as const;

export type Dict = typeof en;
