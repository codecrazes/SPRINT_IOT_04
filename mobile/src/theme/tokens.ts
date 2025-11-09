export const light = {
  colors: {
    bg: '#FFFFFF',
    card: '#FFFFFF',
    text: '#111111',
    subtext: '#323232',
    mutedText: '#666666',
    primary: '#4FAC45',
    primaryText: '#FFFFFF',
    border: '#E3E3E7',
    inputBg: '#F2F2F2',
    black: '#000000',
    white: '#FFFFFF',
    dot: '#CCCCCC',
    error: '#D32F2F',
    success: '#2E7D32',
    overlay: 'rgba(0,0,0,0.5)',
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 20 },
  spacing: (n: number) => 4 * n,
  font: { base: 16, sm: 14, lg: 18, xl: 22, h1: 24, h2: 20 },
};

export const dark: typeof light = {
  ...light,
  colors: {
    ...light.colors,
    bg: '#0E0E0E',
    card: '#17181A',
    text: '#EDEDED',
    subtext: '#A7A7A7',
    mutedText: '#A7A7A7',
    primary: '#7BE074',
    primaryText: '#0B0B0B',
    border: '#2A2B2E',
    inputBg: '#1F2022',
    dot: '#3A3B3E',
  },
};

export type Theme = typeof light;
