export type ThemeMode = 'light' | 'dark';
export type ThemeFont = 'manrope' | 'inter' | 'poppins';

import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

const THEME_STORAGE_KEY = 'pomodoro-theme-mode';
const FONT_STORAGE_KEY = 'pomodoro-theme-font';
const DARK_CLASS = 'ion-palette-dark';

const FONT_FAMILIES: Record<ThemeFont, string> = {
  manrope: '"Manrope", "Avenir Next", "Segoe UI", sans-serif',
  inter: '"Inter", "Avenir Next", "Segoe UI", sans-serif',
  poppins: '"Poppins", "Avenir Next", "Segoe UI", sans-serif',
};

const applyNativeStatusBarStyle = async (mode: ThemeMode): Promise<void> => {
  if (Capacitor.getPlatform() === 'web') {
    return;
  }

  await StatusBar.setStyle({
    style: mode === 'dark' ? Style.Light : Style.Dark,
  });
};

export const getStoredThemeMode = (): ThemeMode => {
  const savedMode = localStorage.getItem(THEME_STORAGE_KEY);
  return savedMode === 'dark' ? 'dark' : 'light';
};

export const getStoredThemeFont = (): ThemeFont => {
  const savedFont = localStorage.getItem(FONT_STORAGE_KEY);
  return savedFont === 'inter' || savedFont === 'poppins' ? savedFont : 'manrope';
};

export const applyThemeFont = (font: ThemeFont): void => {
  document.documentElement.style.setProperty('--ion-font-family', FONT_FAMILIES[font]);
  localStorage.setItem(FONT_STORAGE_KEY, font);
};

export const applyThemeMode = (mode: ThemeMode): void => {
  document.documentElement.classList.toggle(DARK_CLASS, mode === 'dark');
  localStorage.setItem(THEME_STORAGE_KEY, mode);
  void applyNativeStatusBarStyle(mode);
};

export const initializeTheme = (): ThemeMode => {
  const mode = getStoredThemeMode();
  applyThemeMode(mode);
  applyThemeFont(getStoredThemeFont());
  return mode;
};
