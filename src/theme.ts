export type ThemeMode = 'light' | 'dark';

type ColorScheme = {
  background: string;
  surface: string;
  text: string;
  textSubtle: string;
  accent: string;
  accentPressed: string;
  border: string;
};

type Typography = {
  titleXL: {
    fontSize: number;
    fontWeight: '300' | '400' | '500' | '600' | '700' | '800' | '200';
    letterSpacing: number;
  };
  titleL: {
    fontSize: number;
    fontWeight: '300' | '400' | '500' | '600' | '700' | '800' | '200';
    letterSpacing: number;
  };
  body: {
    fontSize: number;
    fontWeight: '300' | '400' | '500';
    letterSpacing: number;
  };
  caption: {
    fontSize: number;
    fontWeight: '300' | '400';
    letterSpacing: number;
  };
};

export type Theme = {
  mode: ThemeMode;
  colors: ColorScheme;
  typography: Typography;
  spacing: (n: number) => number; // 8pt grid
  radius: {
    base: number; // 16
    pill: number; // 24
  };
  shadow: {
    color: string;
    opacity: number; // iOS shadowOpacity 0.08
    radius: number; // 12
    offset: { width: number; height: number };
    elevation: number;
  };
};

const BASE_TYPOGRAPHY: Typography = {
  titleXL: { fontSize: 40, fontWeight: '300', letterSpacing: 0.5 },
  titleL: { fontSize: 36, fontWeight: '300', letterSpacing: 0.5 },
  body: { fontSize: 16, fontWeight: '400', letterSpacing: 0.5 },
  caption: { fontSize: 14, fontWeight: '300', letterSpacing: 0.5 },
};

const SPACING_SCALE = (n: number) => 8 * n;

const SHADOW_COMMON = {
  color: '#000000',
  opacity: 0.08,
  radius: 12,
  offset: { width: 0, height: 4 },
  elevation: 2,
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#F8F7F3',
    surface: '#FFFFFF',
    text: '#2E2F2B',
    textSubtle: '#8C9188',
    accent: '#6E8B77',
    accentPressed: '#5E7B68',
    border: '#DADDD6',
  },
  typography: BASE_TYPOGRAPHY,
  spacing: SPACING_SCALE,
  radius: { base: 16, pill: 24 },
  shadow: SHADOW_COMMON,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#111312',
    surface: '#111312',
    text: '#E8E8E6',
    textSubtle: '#A9AFA7',
    accent: '#6E8B77',
    accentPressed: '#5E7B68',
    border: '#2A2D29',
  },
  typography: BASE_TYPOGRAPHY,
  spacing: SPACING_SCALE,
  radius: { base: 16, pill: 24 },
  shadow: SHADOW_COMMON,
};

export const getTheme = (mode: ThemeMode): Theme => (mode === 'dark' ? darkTheme : lightTheme);


