import React, { useMemo, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Platform, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@theme/useTheme';
import { motoSchema, MotoErros } from '@model/moto';
import { canonicalCategory } from '@utils/motoCategory';
import { useTranslation } from 'react-i18next';

const categories = ['Mottu Sport', 'Mottu E', 'Mottu Pop'];

type Option = { label: string; value: string };
type FormInput = { title: string; subTitle: string; plate: string; stockId?: string | null };
type Props = {
  onAdd: (input: FormInput) => Promise<{ ok: boolean; erros?: MotoErros } | void>;
  busy?: boolean;
  stockOptions: Array<{ id: string; name: string }>;
};

const Select = ({
  value,
  onChange,
  options,
  placeholder,
  error
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string | false;
}) => {
  const { theme } = useTheme();
  const [iosOpen, setIosOpen] = useState(false);
  const [temp, setTemp] = useState(value);
  const { t } = useTranslation();

  const boxStyle = {
    borderWidth: 1,
    borderColor: error ? theme.colors.error : theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.card,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  } as const;

  if (Platform.OS === 'android') {
    return (
      <View style={[boxStyle, { overflow: 'hidden' }]}>
        <Picker
          selectedValue={value}
          onValueChange={(v) => onChange(String(v))}
          dropdownIconColor={theme.colors.text}
          style={{ color: theme.colors.text, height: 50 }}
        >
          {(placeholder ? [{ label: placeholder, value: '' }, ...options] : options).map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
        {!!error && (
          <Text style={{ color: theme.colors.error, fontSize: 12, margin: theme.spacing(2) }}>
            {error}
          </Text>
        )}
      </View>
    );
  }

  const currentLabel = options.find((o) => o.value === value)?.label || placeholder || 'Selecionar';

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setTemp(value);
          setIosOpen(true);
        }}
        activeOpacity={0.8}
        style={[
          boxStyle,
          {
            paddingHorizontal: theme.spacing(3),
            paddingVertical: theme.spacing(3),
            justifyContent: 'center'
          }
        ]}
      >
        <Text style={{ color: value ? theme.colors.text : theme.colors.subtext }}>{currentLabel}</Text>
      </TouchableOpacity>
      {!!error && <Text style={{ color: theme.colors.error, fontSize: 12 }}>{error}</Text>}

      <Modal visible={iosOpen} transparent animationType="slide" onRequestClose={() => setIosOpen(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: '#00000055' }}
          activeOpacity={1}
          onPress={() => setIosOpen(false)}
        />
        <View
          style={{
            backgroundColor: theme.colors.card,
            paddingBottom: theme.spacing(2),
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: theme.spacing(3),
              paddingVertical: theme.spacing(2),
              borderBottomWidth: 1,
              borderColor: theme.colors.border
            }}
          >
            <TouchableOpacity onPress={() => setIosOpen(false)}>
              <Text style={{ color: theme.colors.subtext }}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onChange(temp);
                setIosOpen(false);
              }}
            >
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{t('common.ok')}</Text>
            </TouchableOpacity>
          </View>

          <Picker
            selectedValue={temp}
            onValueChange={(v) => setTemp(String(v))}
            itemStyle={{ color: theme.colors.text }}
            style={{ height: 216 }}
          >
            {(placeholder ? [{ label: placeholder, value: '' }, ...options] : options).map((opt) => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>
      </Modal>
    </>
  );
};

const AddMotoForm: React.FC<Props> = ({ onAdd, busy, stockOptions }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [sub, setSub] = useState(categories[0]);
  const [plate, setPlate] = useState('');
  const [stockId, setStockId] = useState<string | undefined>(undefined);
  const [erros, setErros] = useState<MotoErros>({});

  const invalid = useMemo(() => !title.trim() || !plate.trim(), [title, plate]);

  const handle = async () => {
    setErros({});
    try {
      await motoSchema.validate(
        { title, subTitle: sub, plate, stockId: stockId || undefined },
        { abortEarly: false }
      );
    } catch (err: any) {
      const e: MotoErros = {};
      err.inner?.forEach((x: any) => x.path && (e[x.path as keyof MotoErros] = x.message));
      setErros(e);
      return;
    }
    const res = await onAdd({
      title,
      subTitle: canonicalCategory(sub),
      plate,
      stockId: stockId || undefined
    });
    if (res && !res.ok && res.erros) setErros(res.erros);
    if (!res || (res && res.ok)) {
      setTitle('');
      setPlate('');
      setStockId(undefined);
      setSub(categories[0]);
    }
  };

  const categoryOptions: Option[] = categories.map((c) => ({ label: c, value: c }));
  const stockOpts: Option[] = [{ label: t('addMoto.noStockPlaceholder'), value: '' }].concat(
    stockOptions.map((s) => ({ label: s.name, value: s.id }))
  );

  return (
    <View style={{ padding: theme.spacing(4) }}>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: erros.title ? theme.colors.error : theme.colors.border,
          borderRadius: theme.radius.sm,
          padding: theme.spacing(3),
          backgroundColor: theme.colors.card,
          color: theme.colors.text,
          marginBottom: theme.spacing(2)
        }}
        placeholder={t('addMoto.titlePlaceholder')}
        placeholderTextColor={theme.colors.subtext}
        value={title}
        onChangeText={(v) => {
          setTitle(v);
          if (erros.title) setErros((e) => {
            const { title: _, ...rest } = e;
            return rest as MotoErros;
          });
        }}
      />
      {!!erros.title && <Text style={{ color: theme.colors.error, fontSize: 12 }}>{erros.title}</Text>}

      <Select
        value={sub}
        onChange={(v) => setSub(v || categories[0])}
        options={categoryOptions}
        placeholder={t('addMoto.categoryPlaceholder')}
        error={false}
      />

      <Select
        value={stockId ?? ''}
        onChange={(v) => {
          setStockId(v || undefined);
          if (erros.stockId) setErros((e) => {
            const { stockId: _, ...rest } = e;
            return rest as MotoErros;
          });
        }}
        options={stockOpts}
        placeholder={t('addMoto.noStockPlaceholder')}
        error={erros.stockId}
      />

      <TextInput
        style={{
          borderWidth: 1,
          borderColor: erros.plate ? theme.colors.error : theme.colors.border,
          borderRadius: theme.radius.sm,
          padding: theme.spacing(3),
          backgroundColor: theme.colors.card,
          color: theme.colors.text,
          marginBottom: theme.spacing(2)
        }}
        placeholder={t('addMoto.platePlaceholder')}
        placeholderTextColor={theme.colors.subtext}
        value={plate}
        onChangeText={(v) => {
          setPlate(v);
          if (erros.plate) setErros((e) => {
            const { plate: _, ...rest } = e;
            return rest as MotoErros;
          });
        }}
        autoCapitalize="characters"
      />
      {!!erros.plate && <Text style={{ color: theme.colors.error, fontSize: 12 }}>{erros.plate}</Text>}

      <TouchableOpacity
        disabled={busy || invalid}
        style={{
          alignItems: 'center',
          backgroundColor: busy || invalid ? theme.colors.border : theme.colors.primary,
          borderRadius: theme.radius.sm,
          padding: theme.spacing(3),
          marginTop: theme.spacing(2),
          minHeight: 48,
          justifyContent: 'center'
        }}
        onPress={handle}
      >
        <Text style={{ color: theme.colors.primaryText, fontWeight: 'bold' }}>
          {busy ? t('actions.sending') : t('actions.add')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddMotoForm;
