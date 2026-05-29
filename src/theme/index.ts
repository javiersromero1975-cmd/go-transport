export const LightColors = {
  primary: '#0A0A0A',
  accent: '#F5C842',
  white: '#FFFFFF',
  background: '#F7F8F5',
  border: '#E8EAE6',
  textPrimary: '#0A0A0A',
  textSecondary: '#6B7068',
  textTertiary: '#9CA399',
  success: '#2D6A0F',
  successLight: '#EAF3DE',
  successBorder: '#C0DD97',
  danger: '#C0392B',
  dangerLight: '#FDECEA',
  dangerBorder: '#F7C1C1',
  info: '#1A73E8',
  infoLight: '#E8F0FE',
  warning: '#BA7517',
};

export const DarkColors = {
  primary: '#F5C842',
  accent: '#0A0A0A',
  white: '#1A1A1A',
  background: '#2A2A2A',
  border: '#3A3A3A',
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textTertiary: '#777777',
  success: '#4CAF50',
  successLight: '#1B3A1B',
  successBorder: '#2D6A0F',
  danger: '#E74C3C',
  dangerLight: '#3A1B1B',
  dangerBorder: '#C0392B',
  info: '#64B5F6',
  infoLight: '#1B2A3A',
  warning: '#F5C842',
};

export let Colors = { ...LightColors };

export const setDarkMode = (dark: boolean) => {
  const theme = dark ? DarkColors : LightColors;
  Object.assign(Colors, theme);
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
};

export const Radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};