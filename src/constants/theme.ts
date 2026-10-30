export const Colors = {
  // Brand colors - Warm Ugandan transport amber & deep lake teal
  primary: '#E65100', // Deep energetic amber/orange
  primaryLight: '#FF833A',
  primaryDark: '#AC1900',
  primarySurface: '#FFF3E0',

  secondary: '#00695C', // Deep teal (Lake Victoria / Ankole landscape)
  secondaryLight: '#439889',
  secondaryDark: '#003D33',
  secondarySurface: '#E0F2F1',

  accent: '#F59E0B', // Matatu / Boda yellow
  accentLight: '#FDE68A',

  // Status colors
  success: '#10B981',
  successSurface: '#ECFDF5',
  warning: '#F59E0B',
  warningSurface: '#FFFBEB',
  error: '#EF4444',
  errorSurface: '#FEF2F2',
  info: '#3B82F6',
  infoSurface: '#EFF6FF',

  // Neutrals & Backgrounds
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Text colors
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Dark overlay
  overlay: 'rgba(15, 23, 42, 0.65)',
};

export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    hero: 30,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 22,
  xxl: 28,
  full: 9999,
};

export const Shadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
};
