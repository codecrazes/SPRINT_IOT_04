import { Moto, motoSchema, MotoErros } from '@model/moto';
import {
  fetchCreateMoto,
  fetchDeleteMoto,
  fetchListMotos,
  fetchUpdateMoto,
} from '@fetcher/motoFetcher';
import { canonicalCategory } from '@utils/motoCategory';
import { mapMotoImage } from '@utils/motoImage';
import { ValidationError } from 'yup';
import i18n from '@i18n';

type Ok<T = unknown> = { ok: true; data: T };
type Fail = { ok: false; erroGeral?: string; erros?: MotoErros };

function mapApiError(): string {
  return i18n.t('moto.errors.generic');
}

function hydrate(m: Moto): Moto {
  const sub = canonicalCategory(m.subTitle);
  return { ...m, subTitle: sub, image: mapMotoImage(sub) };
}

export async function listMotos(token: string | null): Promise<Ok<Moto[]> | Fail> {
  try {
    const data = await fetchListMotos(token ?? undefined);
    return { ok: true, data: (data || []).map(hydrate) };
  } catch {
    return { ok: false, erroGeral: i18n.t('inventory.errors.load') };
  }
}

export async function createMoto(
  token: string | null,
  input: Omit<Moto, 'id' | 'image'>,
): Promise<Ok<Moto> | Fail> {
  try {
    await motoSchema.validate(
      { ...input, subTitle: canonicalCategory(input.subTitle) },
      { abortEarly: false },
    );
  } catch (err) {
    const erros: MotoErros = {};
    if (err instanceof ValidationError) {
      err.inner?.forEach((e) => {
        if (e.path) erros[e.path as keyof MotoErros] = e.message;
      });
    }
    return { ok: false, erros };
  }

  try {
    const created = await fetchCreateMoto(token ?? undefined, input);
    return { ok: true, data: hydrate(created) };
  } catch {
    return { ok: false, erroGeral: mapApiError() };
  }
}

export async function updateMoto(
  token: string | null,
  id: string,
  changes: Partial<Omit<Moto, 'id'>>,
): Promise<Ok<Moto> | Fail> {
  try {
    const maybe = {
      title: changes.title ?? 'OK',
      subTitle: canonicalCategory(changes.subTitle ?? 'Mottu Pop'),
      plate: changes.plate ?? 'BRA0A00',
      stockId: changes.stockId ?? null,
    };
    await motoSchema.validate(maybe as Omit<Moto, 'id' | 'image'>, { abortEarly: false });
  } catch (err) {
    const erros: MotoErros = {};
    if (err instanceof ValidationError) {
      err.inner?.forEach((e) => {
        if (e.path) erros[e.path as keyof MotoErros] = e.message;
      });
    }
    return { ok: false, erros };
  }

  try {
    const updated = await fetchUpdateMoto(token ?? undefined, id, changes);
    return { ok: true, data: hydrate(updated) };
  } catch {
    return { ok: false, erroGeral: mapApiError() };
  }
}

export async function deleteMoto(token: string | null, id: string): Promise<Ok | Fail> {
  try {
    await fetchDeleteMoto(token ?? undefined, id);
    return { ok: true, data: true };
  } catch {
    return { ok: false, erroGeral: i18n.t('inventory.errors.delete') };
  }
}
