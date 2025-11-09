export type MotoCategory = 'Mottu Sport' | 'Mottu E' | 'Mottu Pop';

export function canonicalCategory(raw?: string): MotoCategory {
  const s = (raw || '').toLowerCase().trim();
  if (s.includes('sport')) return 'Mottu Sport';
  if (s === 'e' || s.includes('el') || s.includes('eletr')) return 'Mottu E';
  if (s.includes('pop')) return 'Mottu Pop';
  return 'Mottu Pop';
}
