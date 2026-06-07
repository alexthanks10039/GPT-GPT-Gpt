import { getBackendConfig } from './config.js';
import { deleteWebhook, getUpdates } from './telegram.service.js';
import { handleTelegramUpdate } from './bot.routes.js';

let pollingStarted = false;
let pollingStopped = false;
let updateOffset;

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const processUpdate = async (update) => {
  try {
    await handleTelegramUpdate(update);
  } catch (error) {
    console.error('[telegram.polling_update_error]', {
      updateId: update?.update_id,
      message: error.message,
    });
  }
};

export const stopTelegramPolling = () => {
  pollingStopped = true;
};

export const startTelegramPolling = async () => {
  if (pollingStarted) {
    console.warn('[telegram.polling] already started');
    return;
  }

  pollingStarted = true;
  pollingStopped = false;

  const config = getBackendConfig();

  if (config.deleteWebhookOnPolling) {
    try {
      await deleteWebhook({ dropPendingUpdates: false });
      console.log('[telegram.polling] webhook deleted for local polling mode');
    } catch (error) {
      console.warn('[telegram.polling_delete_webhook_failed]', error.message);
    }
  }

  console.log('[telegram.polling] started');

  while (!pollingStopped) {
    try {
      const response = await getUpdates({
        offset: updateOffset,
        timeout: config.pollingTimeoutSeconds,
      });

      const updates = Array.isArray(response.result) ? response.result : [];

      for (const update of updates) {
        updateOffset = Number(update.update_id) + 1;
        await processUpdate(update);
      }
    } catch (error) {
      console.error('[telegram.polling_error]', error.message);
      await sleep(config.pollingRetryMs);
    }
  }

  pollingStarted = false;
  console.log('[telegram.polling] stopped');
};
