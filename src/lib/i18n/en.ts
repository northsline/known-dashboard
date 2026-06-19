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
		searching: 'Looking for your Known…',
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
		bannerOfflineNever:
			"Can't find your Known yet. Check it's plugged in and on the same Wi-Fi as this device. Not set up yet? Go to known.setup first.",
		setupLink: 'known.setup',
		urlTooltip: "this is your Known's address, not a website"
	},

	actions: {
		pause: 'Pause',
		resume: 'Resume',
		connect: 'Connect',
		disconnect: 'Disconnect',
		exportJson: 'Export JSON',
		investigate: 'Investigate',
		openFeed: 'Open recent activity',
		addToAllowlist: 'Add to allowlist',
		remove: 'Remove',
		needHelp: 'Need help connecting?',
		openSetup: 'Set up at',
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
		emptyTrafficBody: "Once your Known is connected, you'll see what's talking on your network.",
		emptyFilterTitle: 'Nothing matches these filters.',
		emptyFilterBody: 'Try clearing the search or filters.'
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
		emptyBody:
			"Check Known is plugged in. Check your router is using it for DNS. Then refresh."
	},

	feed: {
		eyebrow: 'Recent activity',
		title: 'Network conversations, <em>over the past week.</em>',
		search: 'Filter by domain, IP, device…',
		filterAll: 'All',
		filterAlerts: 'Alerts',
		filterWatch: 'Watch',
		filterInfo: 'Info',
		allDetections: 'All detections',
		streaming: 'recent activity',
		matching: 'matching events',
		emptyTitle: 'No audit yet.',
		emptyBody: 'Recent activity shows up once your device connects.'
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
		emptyBody: 'Flagged exchanges show up once your device connects.'
	},

	allowlist: {
		eyebrow: 'Reviewed',
		title: "Things you've <em>reviewed.</em>",
		lead:
			"Rules stay on your device. Anything here is hidden from your feed, but still recorded, so you can review it later. Add them as you go.",
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
		emptyTitle: 'Nothing reviewed yet.',
		emptyBody: 'Add rules as you find traffic you trust. You can add them anytime.',
		reviewed: 'reviewed',
		of: 'of',
		flagged: 'flagged'
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
		body: "Known keeps an eye on the DNS traffic on your network. It never blocks anything. It never sends your data anywhere."
	},

	worry: {
		label: 'Should I worry?',
		clear: 'No traffic yet',
		normal: 'All clear',
		watch: 'Worth a look',
		alert: 'Needs attention',
		reduce: 'What you can do'
	}
} as const;

export type Dict = typeof en;
