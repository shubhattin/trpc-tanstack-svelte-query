import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function getSystemTheme(): Theme {
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme(): Theme {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark') return stored;
	return getSystemTheme();
}

function applyTheme(theme: Theme) {
	document.documentElement.dataset.theme = theme;
}

class ThemeState {
	theme = $state<Theme>('light');

	init() {
		if (!browser) return;
		this.theme = getInitialTheme();
		applyTheme(this.theme);
	}

	toggle() {
		this.theme = this.theme === 'light' ? 'dark' : 'light';
		applyTheme(this.theme);
		localStorage.setItem(STORAGE_KEY, this.theme);
	}
}

export const themeState = new ThemeState();
