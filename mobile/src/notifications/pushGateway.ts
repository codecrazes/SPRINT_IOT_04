import i18n from '@i18n';
import { sendPush } from '../service/pushService';

export type NewStockPayload = {
  id: string;
  name: string;
};

export async function notifyNewStock(to: string, stock: NewStockPayload) {
  return sendPush({
    to,
    title: i18n.t('push.newStock.title'),
    body: i18n.t('push.newStock.body', { name: stock.name }),
    data: {
      screen: 'Stocks',
      params: {}
    }
  });
}
