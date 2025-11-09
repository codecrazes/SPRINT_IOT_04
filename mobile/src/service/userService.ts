import { lookupProfile, updateProfile } from '@fetcher/authFetcher';
import { perfilSchema } from '@model/usuario';
import { ValidationError } from 'yup';
import i18n from '@i18n';

type GetProfileOk = { ok: true; email: string; nome: string };
type GetProfileFail = { ok: false; erroGeral: string };

export async function getProfileService(idToken: string): Promise<GetProfileOk | GetProfileFail> {
  try {
    const { users } = await lookupProfile(idToken);
    const u = users?.[0];
    if (!u) return { ok: false, erroGeral: i18n.t('user.errors.notFound') };
    return { ok: true, email: u.email, nome: u.displayName || '' };
  } catch {
    return { ok: false, erroGeral: i18n.t('user.errors.load') };
  }
}

type UpdateProfileOk = { ok: true };
type UpdateProfileFail = { ok: false; erroGeral: string };

export async function updateProfileService(
  idToken: string,
  nome: string,
): Promise<UpdateProfileOk | UpdateProfileFail> {
  try {
    await perfilSchema.validate({ nome }, { abortEarly: false });
  } catch (err) {
    if (err instanceof ValidationError) {
      const msg = err.errors?.[0] || i18n.t('user.errors.invalidName');
      return { ok: false, erroGeral: msg };
    }
    return { ok: false, erroGeral: i18n.t('user.errors.invalidName') };
  }

  try {
    await updateProfile(idToken, nome);
    return { ok: true };
  } catch {
    return { ok: false, erroGeral: i18n.t('user.errors.update') };
  }
}
