import { webhookCallback } from 'grammy';
import { bot } from '@/lib/bot-instance';
import { setupCommands } from '@/lib/bot-commands';

// Only setup commands once
setupCommands(bot);

const handleUpdate = webhookCallback(bot, 'next-js');

export const GET = handleUpdate;
export const POST = handleUpdate;

// A note on setting up the webhook:
// To set the webhook, you can run the following command in your terminal
// (replace <TOKEN> and <URL> with your actual bot token and deployment URL):
// curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<URL>/api/telegram"
// This only needs to be done once for your bot.
