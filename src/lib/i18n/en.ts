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

	connection: {
		searching: 'Searching for Known…',
		connected: 'Connected to your Known',
		offline: 'Not detected',
		paused: 'Paused',
		linkedTo: 'known.local',
		bannerOffline:
			"Can't find your Known. Check that it's powered on and on the same Wi-Fi network.",
		manualLabel: 'Enter its IP address manually',
		manualPlaceholder: '192.168.1.42 or known.local',
		manualConnect: 'Connect',
		manualConnecting: 'Connecting…',
		manualInvalid: "Couldn't reach a Known device at that address.",
		manualInvalidFormat: 'Please enter a valid IP address or hostname.',
		forgetIp: 'Forget saved IP',
		bannerOfflineNever: "We can't find your Known yet. Make sure it's plugged in and on the same Wi-Fi as this device. Set it up first at",
		setupLink: 'known.setup',
		urlTooltip: 'this is your device, not a website'
	},

	actions: {
		pause: 'Pause',
		resume: 'Resume',
		connect: 'Connect',
		disconnect: 'Disconnect',
		exportJson: 'Export JSON',
		investigate: 'Investigate',
		openFeed: 'Open weekly audit',
		addToAllowlist: 'Add to allowlist',
		remove: 'Remove',
		needHelp: 'Need help connecting?',
		openSetup: 'Open',
		whatIsThis: "What's this?"
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
		waitingForTraffic: 'Looking for DNS traffic…',
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
		emptyTitle: 'No devices detected yet',
		emptyBody: "Make sure your router points to Known's IP for DNS, then refresh."
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
		hintChip: '*.domain.com',
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
	},

	explainer: {
		eyebrow: 'About Known',
		body: "Known watches your network's DNS traffic. It never blocks anything. It never sends your data anywhere."
	}
} as const;

export type Dict = typeof en;
