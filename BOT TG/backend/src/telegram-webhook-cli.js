import 'dotenv/config';
import { getPublicWebhookUrl } from './config.js';
import { deleteWebhook, getWebhookInfo, setWebhook } from './telegram.service.js';

const command = process.argv[2] || 'info';

const print = (value) => {
  console.log(JSON.stringify(value, null, 2));
};

try {
  if (command === 'set') {
    const url = getPublicWebhookUrl();
    const result = await setWebhook(url);
    print({
      ok: true,
      action: 'setWebhook',
      url,
      result: result.result,
      description: result.description,
    });
  } else if (command === 'delete') {
    const result = await deleteWebhook({ dropPendingUpdates: false });
    print({
      ok: true,
      action: 'deleteWebhook',
      result: result.result,
      description: result.description,
    });
  } else if (command === 'info') {
    const result = await getWebhookInfo();
    print({
      ok: true,
      action: 'getWebhookInfo',
      result: result.result,
    });
  } else {
    console.error(`Unknown command: ${command}`);
    console.error('Use one of: set, delete, info');
    process.exitCode = 1;
  }
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    action: command,
    message: error.message,
  }, null, 2));
  process.exitCode = 1;
}
