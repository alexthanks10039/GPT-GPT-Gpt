import { buildLeadMessage, leadActionKeyboard, persistentNavigationKeyboard } from './bot-ui.service.js';
import { requireOwnerId, requireTelegramToken } from './config.js';

const getTelegramToken = () => {
  return requireTelegramToken();
};

const getConfig = () => {
  const token = getTelegramToken();
  const ownerId = requireOwnerId();

  return { token, ownerId };
};

export const telegramApi = async (method, payload = {}) => {
  const token = getTelegramToken();

  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.description || `Telegram ${method} failed`);
  }

  return data;
};

export const getBotInfo = async () => telegramApi('getMe');

export const getWebhookInfo = async () => telegramApi('getWebhookInfo');

export const getUpdates = async ({ offset, timeout = 25 } = {}) => {
  const payload = {
    timeout,
    allowed_updates: ['message', 'callback_query'],
  };

  if (offset !== undefined && offset !== null) {
    payload.offset = offset;
  }

  return telegramApi('getUpdates', payload);
};

export const setWebhook = async (url) => {
  if (!url) {
    throw new Error('Webhook URL is required');
  }

  return telegramApi('setWebhook', {
    url,
    allowed_updates: ['message', 'callback_query'],
  });
};

export const deleteWebhook = async ({ dropPendingUpdates = false } = {}) => {
  return telegramApi('deleteWebhook', {
    drop_pending_updates: dropPendingUpdates,
  });
};

export const sendMessage = async ({ chatId, text, replyMarkup }) => {
  return telegramApi('sendMessage', {
    chat_id: chatId,
    text,
    reply_markup: replyMarkup,
    disable_web_page_preview: true,
  });
};

export const answerCallbackQuery = async ({ callbackQueryId, text }) => {
  return telegramApi('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
    show_alert: false,
  });
};

export const editMessage = async ({ chatId, messageId, text, replyMarkup }) => {
  return telegramApi('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    reply_markup: replyMarkup,
    disable_web_page_preview: true,
  });
};

export const sendOwnerLeadNotification = async (lead) => {
  const { ownerId } = getConfig();

  await sendMessage({
    chatId: ownerId,
    text: buildLeadMessage(lead),
    replyMarkup: leadActionKeyboard(lead),
  });

  await sendMessage({
    chatId: ownerId,
    text: 'Навигация доступна снизу. Из любого раздела можно вернуться в главное меню.',
    replyMarkup: persistentNavigationKeyboard(),
  });

  return { ok: true };
};
