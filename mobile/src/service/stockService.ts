import { Stock, stockSchema, StockErros } from '@model/stock';
import {
  fetchCreateStock,
  fetchDeleteStock,
  fetchListStocks,
  fetchUpdateStock,
} from '@fetcher/stockFetcher';
import { ValidationError } from 'yup';
import i18n from '@i18n';

type Ok<T = unknown> = { ok: true; data: T };
type Fail = { ok: false; erroGeral?: string; erros?: StockErros };

function mapApiError() {
  return i18n.t('stock.errors.generic');
}

export async function listStocks(token: string): Promise<Ok<Stock[]> | Fail> {
  try {
    const data = await fetchListStocks(token);
    return { ok: true, data };
  } catch {
    return { ok: false, erroGeral: i18n.t('stock.errors.load') };
  }
}

export async function createStock(
  token: string,
  input: Omit<Stock, 'id'>,
): Promise<Ok<Stock> | Fail> {
  try {
    await stockSchema.validate(input, { abortEarly: false });
  } catch (err) {
    const erros: StockErros = {};
    if (err instanceof ValidationError) {
      err.inner?.forEach((e) => {
        if (e.path) erros[e.path as keyof StockErros] = e.message;
      });
    }
    return { ok: false, erros };
  }

  try {
    const data = await fetchCreateStock(token, input);
    return { ok: true, data };
  } catch {
    return { ok: false, erroGeral: i18n.t('stock.errors.create') };
  }
}

export async function updateStock(
  token: string,
  id: string,
  changes: Omit<Stock, 'id'>,
): Promise<Ok<Stock> | Fail> {
  try {
    await stockSchema.validate(changes, { abortEarly: false });
  } catch (err) {
    const erros: StockErros = {};
    if (err instanceof ValidationError) {
      err.inner?.forEach((e) => {
        if (e.path) erros[e.path as keyof StockErros] = e.message;
      });
    }
    return { ok: false, erros };
  }

  try {
    const data = await fetchUpdateStock(token, id, changes);
    return { ok: true, data };
  } catch {
    return { ok: false, erroGeral: i18n.t('stock.errors.update') };
  }
}

export async function deleteStock(token: string, id: string): Promise<Ok | Fail> {
  try {
    await fetchDeleteStock(token, id);
    return { ok: true, data: true };
  } catch {
    return { ok: false, erroGeral: i18n.t('stock.errors.delete') };
  }
}
