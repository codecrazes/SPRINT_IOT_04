import * as yup from 'yup';

export type Stock = {
  id: string;
  name: string;
  quantity: number;
  location?: string;
};

export const stockSchema = yup.object({
  name: yup.string().trim().required('Informe o nome'),
  quantity: yup
    .number()
    .typeError('Quantidade inválida')
    .min(0, 'Não pode ser negativa')
    .required('Informe a quantidade'),
  location: yup.string().trim().optional(),
});

export type StockErros = Partial<Record<'name' | 'quantity' | 'location', string>>;
