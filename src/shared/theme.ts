export const Colors = {
  background: '#0d0d0d',
  surface: '#111111',
  surfaceElevated: '#1a1a1a',
  border: '#222222',
  primary: '#00ff88',
  primaryMuted: 'rgba(0, 255, 136, 0.15)',
  danger: '#ff4444',
  dangerMuted: 'rgba(255, 68, 68, 0.15)',
  textPrimary: '#ffffff',
  textSecondary: '#aaaaaa',
  textMuted: '#666666',
  tabBarInactive: '#444444',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Typography = {
  timerLarge: {
    fontSize: 56,
    fontWeight: '900' as const,
    fontVariant: ['tabular-nums'] as const,
    letterSpacing: -2,
  },
  timerLabel: {
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '600' as const,
  },
  heading: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 14 },
  caption: { fontSize: 11, letterSpacing: 1 },
} as const;
