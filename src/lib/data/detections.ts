import type { DetectionMeta } from '$lib/types';

// Static detection metadata, not mock data. These are the five behaviours
// Known looks for; the copy mirrors the marketing site. Safe to import in
// production paths.
export const DETECTIONS: DetectionMeta[] = [
	{
		kind: 'new-connection',
		num: '01',
		label: 'New connection',
		blurb: 'A device talks to a server it has never contacted before.'
	},
	{
		kind: 'data-spike',
		num: '02',
		label: 'Data spike',
		blurb: 'Your smart bulb suddenly uploads 50MB. Why?'
	},
	{
		kind: 'unknown-endpoint',
		num: '03',
		label: 'Unknown endpoint',
		blurb: 'Traffic going to IPs outside known safe lists.'
	},
	{
		kind: 'night-activity',
		num: '04',
		label: 'Night activity',
		blurb: "Devices waking up and talking while you're asleep."
	},
	{
		kind: 'dns-hijack',
		num: '05',
		label: 'DNS hijack',
		blurb: 'Requests being pointed at suspicious resolvers.'
	}
];
