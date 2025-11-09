import { TextInput, TextInputProps, View, Text } from 'react-native';

import { useTheme } from '@theme/useTheme';

type Props = TextInputProps & { errorText?: string };

export default function Input({ errorText, style, ...props }: Props) {
  const { theme } = useTheme();
  const hasError = !!errorText;

  return (
    <View style={{ width: '100%' }}>
      <TextInput
        placeholderTextColor={theme.colors.subtext}
        style={[
          {
            borderWidth: 1,
            borderColor: hasError ? theme.colors.error : theme.colors.border,
            borderRadius: theme.radius.sm,
            paddingHorizontal: theme.spacing(3),
            paddingVertical: theme.spacing(3),
            color: theme.colors.text,
            backgroundColor: theme.colors.card,
            minHeight: 48,
            fontSize: theme.font.base,
          },
          style,
        ]}
        {...props}
      />
      {!!errorText && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: theme.colors.error,
              marginRight: 6,
            }}
          />
          <Text style={{ color: theme.colors.error, fontSize: 12 }}>{errorText}</Text>
        </View>
      )}
    </View>
  );
}
