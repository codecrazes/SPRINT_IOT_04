import * as yup from 'yup';
import { ImageSourcePropType } from 'react-native';

export type Moto = {
  id: string;
  title: string;
  subTitle: string;
  plate: string;
  stockId?: string | null;
  image?: ImageSourcePropType;
};

export const motoSchema = yup.object({
  title: yup.string().trim().required('Informe o título'),
  subTitle: yup.string().trim().required('Selecione a categoria'),
  plate: yup.string().trim().required('Informe a placa').min(6, 'Mínimo 6 caracteres'),
  stockId: yup.string().optional().nullable(),
});

export type MotoErros = Partial<Record<keyof Omit<Moto, 'id' | 'image'>, string>>;
