import { Pressable, Text, ViewStyle, ActivityIndicator } from 'react-native';

import { useTheme } from '@theme/useTheme';

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};
export default function Button({ title, onPress, disabled, loading, style }: Props) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          backgroundColor: isDisabled ? theme.colors.border : theme.colors.primary,
          borderRadius: theme.radius.md,
          paddingVertical: theme.spacing(3),
          paddingHorizontal: theme.spacing(4),
          opacity: pressed ? 0.85 : 1,
          alignItems: 'center',
          minHeight: 48,
          flexDirection: 'row',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {loading && <ActivityIndicator style={{ marginRight: 8 }} color={theme.colors.primaryText} />}
      <Text style={{ color: theme.colors.primaryText, fontSize: theme.font.lg, fontWeight: '600' }}>
        {title}
      </Text>
    </Pressable>
  );
}
