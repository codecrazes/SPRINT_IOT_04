import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@theme/useTheme';

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
};

export default function EmptyState({ title, subtitle, actionLabel, onAction, testID }: Props) {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: theme.spacing(10) }} testID={testID}>
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: theme.colors.inputBg,
          marginBottom: theme.spacing(2)
        }}
      />
      <Text style={{ color: theme.colors.text, fontWeight: '600', marginBottom: 4 }}>{title}</Text>
      {!!subtitle && (
        <Text style={{ color: theme.colors.subtext, textAlign: 'center' }}>{subtitle}</Text>
      )}
      {!!actionLabel && !!onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={{
            marginTop: theme.spacing(3),
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing(4),
            paddingVertical: theme.spacing(3),
            borderRadius: theme.radius.sm
          }}
        >
          <Text style={{ color: theme.colors.primaryText, fontWeight: '700' }}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
