import { usuarioSchema, Usuario, UsuarioErros } from '@model/usuario';
import { postLogin, postRegister } from '@fetcher/authFetcher';
import { ValidationError } from 'yup';
import i18n from '@i18n';

type Ok = { ok: true; token: string; email: string };
type Fail = { ok: false; erroGeral?: string; erros?: UsuarioErros };

function mapApiError(code?: string): string {
  switch (code) {
    case 'EMAIL_EXISTS':
      return i18n.t('auth.errors.emailExists');
    case 'INVALID_LOGIN_CREDENTIALS':
    case 'INVALID_PASSWORD':
    case 'EMAIL_NOT_FOUND':
      return i18n.t('auth.errors.invalidCredentials');
    case 'TOO_MANY_ATTEMPTS_TRY_LATER':
      return i18n.t('auth.errors.tooManyAttempts');
    default:
      return i18n.t('auth.errors.generic');
  }
}

function extractFirebaseError(e: unknown): string | undefined {
  const err = e as { response?: { data?: { error?: { message?: string } } } };
  return err?.response?.data?.error?.message;
}

export async function loginService(u: Usuario): Promise<Ok | Fail> {
  try {
    await usuarioSchema.validate(u, { abortEarly: false });
  } catch (err) {
    const erros: UsuarioErros = {};
    if (err instanceof ValidationError) {
      err.inner?.forEach((e) => {
        if (e.path) erros[e.path as keyof Usuario] = e.message;
      });
    }
    return { ok: false, erros };
  }

  try {
    const data = await postLogin(u);
    return { ok: true, token: data.idToken, email: data.email };
  } catch (e) {
    return { ok: false, erroGeral: mapApiError(extractFirebaseError(e)) };
  }
}

export async function registerService(u: Usuario): Promise<Ok | Fail> {
  try {
    await usuarioSchema.validate(u, { abortEarly: false });
  } catch (err) {
    const erros: UsuarioErros = {};
    if (err instanceof ValidationError) {
      err.inner?.forEach((e) => {
        if (e.path) erros[e.path as keyof Usuario] = e.message;
      });
    }
    return { ok: false, erros };
  }

  try {
    const data = await postRegister(u);
    return { ok: true, token: data.idToken, email: data.email };
  } catch (e) {
    return { ok: false, erroGeral: mapApiError(extractFirebaseError(e)) };
  }
}
