import { Text } from 'react-native';

import { useTheme } from '@theme/useTheme';

export default function ErrorMessage({ text }: { text?: string }) {
  const { theme } = useTheme();
  if (!text) return null;
  return <Text style={{ color: theme.colors.error, fontSize: 12 }}>{text}</Text>;
}
