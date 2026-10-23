import { alpha, createTheme } from '@mui/material/styles';

const UI_FONT = '"Barlow", system-ui, -apple-system, "Segoe UI", sans-serif';
const FIGURE_FONT = '"Barlow Condensed", "Barlow", system-ui, sans-serif';

// The shell stays night indigo in both modes; only the work surfaces switch
const SHELL = {
  bar: '#151935',
  barText: '#ECEAF6',
  barMuted: '#A9AEDA',
};

const PALETTES = {
  dark: {
    mode: 'dark',
    primary: { main: '#FFB23F', dark: '#E09520', contrastText: '#1F1400' },
    secondary: { main: '#8F9BFF' },
    error: { main: '#FF6B81' },
    warning: { main: '#FFB23F' },
    success: { main: '#3DD6A3' },
    background: { default: '#0E1126', paper: '#161A35' },
    text: { primary: '#ECEAF6', secondary: '#A3A8CC', disabled: '#6B7099' },
    divider: 'rgba(160, 170, 235, 0.14)',
    band: { budget: '#3DD6A3', mid: '#6CB8FF', upper: '#B490FF', premium: '#FF6B8B' },
    raised: '#1E2344',
    mapTiles: 'Dark',
    tileFilter: 'brightness(0.5) sepia(1) hue-rotate(200deg) saturate(2.4) contrast(1.05)',
  },
  light: {
    mode: 'light',
    primary: { main: '#9A5B00', dark: '#7A4700', contrastText: '#FFFFFF' },
    secondary: { main: '#4B55C8' },
    error: { main: '#C62F4B' },
    warning: { main: '#9A5B00' },
    success: { main: '#0E8A63' },
    background: { default: '#E9EBF5', paper: '#FFFFFF' },
    text: { primary: '#171A33', secondary: '#555A7C', disabled: '#9A9EBB' },
    divider: 'rgba(30, 35, 80, 0.12)',
    band: { budget: '#0E9E70', mid: '#2F7FD8', upper: '#7B52DB', premium: '#D93A5C' },
    raised: '#F3F4FA',
    mapTiles: 'Light',
    tileFilter: 'sepia(0.4) hue-rotate(195deg) saturate(1.4)',
  },
};

export function createAppTheme(mode) {
  const palette = { ...PALETTES[mode], shell: SHELL };

  return createTheme({
    palette,
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: UI_FONT,
      fontSize: 14,
      h1: { fontFamily: FIGURE_FONT, fontWeight: 700, fontSize: '1.375rem', letterSpacing: '0.01em', lineHeight: 1.1 },
      h2: { fontFamily: UI_FONT, fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.3 },
      h3: { fontFamily: UI_FONT, fontWeight: 600, fontSize: '1rem', lineHeight: 1.35 },
      subtitle2: { fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.35 },
      body2: { fontSize: '0.875rem', lineHeight: 1.45 },
      caption: { fontSize: '0.75rem', lineHeight: 1.4 },
      overline: { fontWeight: 600, fontSize: '0.6875rem', letterSpacing: '0.12em', lineHeight: 1.6 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
      figure: {
        fontFamily: FIGURE_FONT,
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: 1.1,
        fontVariantNumeric: 'tabular-nums',
      },
      figureLarge: {
        fontFamily: FIGURE_FONT,
        fontWeight: 700,
        fontSize: '2rem',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: theme => ({
          'html, body, #root': { height: '100%' },
          body: { overscrollBehavior: 'none' },
          '::selection': { background: alpha(theme.palette.primary.main, 0.35), color: theme.palette.text.primary },
          'input, textarea': { caretColor: theme.palette.primary.main },
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${alpha(theme.palette.text.secondary, 0.35)} transparent`,
          },
          ':focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
          a: { textUnderlineOffset: '0.2em' },
          '.leaflet-container': {
            background: theme.palette.background.default,
            fontFamily: UI_FONT,
          },
          '.base-tiles': { filter: theme.palette.tileFilter },
          '.leaflet-control-attribution': {
            background: `${alpha(theme.palette.background.paper, 0.8)} !important`,
            color: `${theme.palette.text.secondary} !important`,
            fontSize: '10px',
          },
          '.leaflet-control-attribution a': { color: `${theme.palette.text.secondary} !important` },
          '.leaflet-bar a, .leaflet-bar a:hover': {
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderColor: theme.palette.divider,
          },
          '.leaflet-bar': { border: `1px solid ${theme.palette.divider} !important`, borderRadius: '10px !important', overflow: 'hidden' },
          '.leaflet-tooltip.drop-label': {
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            border: 'none',
            borderRadius: 6,
            padding: '2px 8px',
            fontFamily: FIGURE_FONT,
            fontWeight: 700,
            fontSize: 14,
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          },
          '.leaflet-tooltip.drop-label::before': { display: 'none' },
          '.leaflet-tooltip.office-label': {
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
            fontFamily: UI_FONT,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          },
          '.office-icon': { background: 'none', border: 'none' },
        }),
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 8 } },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            textTransform: 'none',
            fontWeight: 600,
            padding: '4px 12px',
            borderColor: theme.palette.divider,
            '&.Mui-selected': {
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.14),
            },
          }),
        },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiTooltip: {
        styleOverrides: {
          tooltip: ({ theme }) => ({
            backgroundColor: theme.palette.mode === 'dark' ? '#2A3058' : '#22264A',
            fontSize: '0.75rem',
          }),
        },
      },
      MuiTab: {
        styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 44 } },
      },
      MuiTabs: { styleOverrides: { root: { minHeight: 44 } } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.mode === 'dark' ? alpha('#000', 0.18) : theme.palette.background.paper,
          }),
          notchedOutline: ({ theme }) => ({ borderColor: theme.palette.divider }),
        },
      },
      MuiListSubheader: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            lineHeight: '32px',
          }),
        },
      },
    },
  });
}
