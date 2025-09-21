export type ThemeMode = 'light' | 'dark';

type ColorScheme = {
  background: string;
  surface: string;
  text: string;
  textSubtle: string;
  accent: string;
  accentPressed: string;
  border: string;
  // ZEENトークン追加
  inkBlack: string;
  mossGreen: string;
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
  // ZEENトークン追加
  timer: {
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
  // ZEENトークン追加
  padding: {
    horizontal: number; // 24
    vertical: number; // 32
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
  titleXL: { fontSize: 44, fontWeight: '300', letterSpacing: 0.5 }, // ZEENトークン: 44/300
  titleL: { fontSize: 36, fontWeight: '300', letterSpacing: 0.5 },
  timer: { fontSize: 80, fontWeight: '300', letterSpacing: 0.5 }, // ZEENトークン: 80/300
  body: { fontSize: 16, fontWeight: '400', letterSpacing: 0.5 },
  caption: { fontSize: 14, fontWeight: '300', letterSpacing: 0.5 },
};

const SPACING_SCALE = (n: number) => 8 * n;

// ZEENトークン定義
const ZEEN_PADDING = {
  horizontal: 24,
  vertical: 32,
};

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
    // ZEENトークン追加
    inkBlack: '#0F1110',
    mossGreen: '#6E8B77',
  },
  typography: BASE_TYPOGRAPHY,
  spacing: SPACING_SCALE,
  radius: { base: 16, pill: 24 },
  padding: ZEEN_PADDING,
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
    // ZEENトークン追加
    inkBlack: '#0F1110',
    mossGreen: '#6E8B77',
  },
  typography: BASE_TYPOGRAPHY,
  spacing: SPACING_SCALE,
  radius: { base: 16, pill: 24 },
  padding: ZEEN_PADDING,
  shadow: SHADOW_COMMON,
};

export const getTheme = (mode: ThemeMode): Theme => (mode === 'dark' ? darkTheme : lightTheme);


