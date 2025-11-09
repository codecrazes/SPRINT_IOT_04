type PushMessage = {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, any>;
};

async function sendSingle(msg: Omit<PushMessage, 'to'> & { to: string }) {
  const payload = {
    to: msg.to,
    title: msg.title,
    body: msg.body,
    data: msg.data || {},
    sound: null
  };
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function sendPush(message: PushMessage) {
  if (Array.isArray(message.to)) {
    const results = [];
    for (const t of message.to) {
      results.push(await sendSingle({ to: t, title: message.title, body: message.body, data: message.data }));
    }
    return results;
  }
  return sendSingle({ to: message.to, title: message.title, body: message.body, data: message.data });
}
