import { ImageSourcePropType } from 'react-native';

import { iconMap } from '@utils/iconMap';

import { canonicalCategory, MotoCategory } from './motoCategory';

export function mapMotoImage(subTitle?: string): ImageSourcePropType {
  const cat: MotoCategory = canonicalCategory(subTitle);
  return iconMap[cat];
}
