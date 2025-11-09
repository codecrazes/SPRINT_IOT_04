import { View, ViewProps } from 'react-native';

import { useTheme } from '@theme/useTheme';

export default function Screen({ style, ...rest }: ViewProps) {
  const { theme } = useTheme();
  return <View style={[{ flex: 1, backgroundColor: theme.colors.bg }, style]} {...rest} />;
}
