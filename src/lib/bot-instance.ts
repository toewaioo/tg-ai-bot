import { Bot } from 'grammy';
import { setupCommands } from './bot-commands';
import { setupForwardVideosCommands } from './forward-command';

// Use NEXT_PUBLIC_TELEGRAM_BOT_TOKEN to be consistent and available for the client-side link.
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error(
    'NEXT_PUBLIC_TELEGRAM_BOT_TOKEN is not set! The bot will not be able to start.'
  );
}

// Create bot object
export const bot = new Bot(token || '');

// Register commands
setupCommands(bot);
//
setupForwardVideosCommands(bot)

