import { Bot } from 'grammy';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error(
    'TELEGRAM_BOT_TOKEN is not set! The bot will not be able to start.'
  );
}

// Create bot object
export const bot = new Bot(token || '');
