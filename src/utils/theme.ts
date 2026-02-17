export const COLORS = {
  // Brand — black
  primary: '#111111',
  primaryLight: '#333333',
  primaryDark: '#000000',
  accent: '#111111',

  // Neutrals
  white: '#FFFFFF',
  offWhite: '#F7F7F5',
  cream: '#F0EFEB',
  lightGray: '#E5E5E3',
  midGray: '#999999',
  darkGray: '#666666',
  charcoal: '#333333',
  black: '#111111',

  // Semantic text
  textPrimary: '#111111',
  textSecondary: '#999999',
  textTertiary: '#666666',

  // Surfaces
  surface: '#FFFFFF',
  surfaceElevated: '#F7F7F5',
  border: '#E5E5E3',

  // Status
  success: '#34C759',
  error: '#FF453A',
  warning: '#FFD60A',
  info: '#0A84FF',

  // Functional
  background: '#F7F7F5',
  cardBg: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Tab bar
  tabBarBg: '#FFFFFF',
  tabBarActive: '#111111',
  tabBarInactive: '#BBBBBB',
};

// Poppins — clean minimal sans-serif throughout
// fontWeight selects the correct variant (Light/Regular/Medium/SemiBold/Bold)
export const FONTS = {
  serif: 'Poppins',
  sans: 'Poppins',
  sansMedium: 'Poppins',
  sansBold: 'Poppins',
};

export const FONT_WEIGHTS = {
  bold: '700' as const,
  semiBold: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
  light: '300' as const,
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  h1: 32,
  h2: 26,
  h3: 22,
  h4: 18,
  body: 15,
  bodySmall: 13,
  caption: 12,
  tiny: 10,

  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 100,

  screenPadding: 20,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
};
