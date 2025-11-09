export const light = {
  colors: { bg: '#FFFFFF', text: '#111111', primary: '#1e88e5', error: '#d32f2f' },
  spacing: (n: number) => 4 * n,
};

export const dark = {
  colors: { bg: '#0E0E0E', text: '#EEEEEE', primary: '#90caf9', error: '#ef9a9a' },
  spacing: (n: number) => 4 * n,
};

export type Theme = typeof light;
