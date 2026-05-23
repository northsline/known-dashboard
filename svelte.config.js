import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Static adapter, the dashboard ships as a self-contained client bundle.
		// It talks to the Known device over the local network; there is no server.
		adapter: adapter({
			fallback: 'index.html'
		})
	}
};

export default config;
