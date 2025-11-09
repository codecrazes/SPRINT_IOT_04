import * as yup from 'yup';

export type Usuario = {
  email: string;
  senha: string;
};

export type UsuarioErros = Partial<Record<keyof Usuario, string>>;

export const usuarioSchema = yup.object({
  email: yup.string().required('Informe seu e-mail').email('E-mail inválido'),
  senha: yup.string().required('Informe a senha').min(5, 'Mínimo de 5 caracteres'),
});

export type UsuarioPerfil = {
  email: string;
  nome?: string;
};

export const perfilSchema = yup.object({
  nome: yup.string().trim().min(2, 'Mínimo de 2 caracteres'),
});
