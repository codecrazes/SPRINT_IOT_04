import { ImageSourcePropType } from 'react-native';
import mottuSport from '../../assets/mottu-sport.png';
import mottuE from '../../assets/mottu-e.png';
import mottuPop from '../../assets/mottu-pop.png';

export type MotoCategory = 'Mottu Sport' | 'Mottu E' | 'Mottu Pop';

export const iconMap: Record<MotoCategory, ImageSourcePropType> = {
  'Mottu Sport': mottuSport,
  'Mottu E': mottuE,
  'Mottu Pop': mottuPop,
} as const;
