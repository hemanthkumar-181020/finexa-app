export const Colors = {
  deepNavy: {
    dark: '#0A1628',
    light: '#0D3B66',
  },
  teal: {
    dark: '#1B6B7C',
    light: '#4FA89B',
  },
  mint: '#7FDBCA',
  white: '#FFFFFF',
  black: '#000000',
  error: '#FF6B6B',
  success: '#4CAF50',
  overlay: 'rgba(255, 255, 255, 0.1)',
  glassBackground: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.15)',
  inputBackground: 'rgba(255, 255, 255, 0.05)',
  inputBorder: 'rgba(255, 255, 255, 0.2)',
  inputBorderFocused: 'rgba(127, 219, 202, 0.6)',
  placeholder: 'rgba(255, 255, 255, 0.5)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
};

export const Gradients = {
  primary: ['#0A1628', '#0D3B66', '#1B6B7C'],
  accent: ['#1B6B7C', '#4FA89B', '#7FDBCA'],
  button: ['#1B6B7C', '#4FA89B'],
  buttonPressed: ['#155A69', '#3F8C80'],
} as const;


export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Typography = {
  heading1: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.textPrimary,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const AnimationConfig = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  buttonScale: {
    pressed: 0.96,
    normal: 1,
  },
};
