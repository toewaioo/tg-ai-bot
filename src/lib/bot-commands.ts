import type { Bot } from 'grammy';
import {
  addSubscription,
  getSubscriptions,
  removeSubscription,
} from '@/lib/subscriptions';

export const setupCommands = (bot: Bot) => {
  bot.command('start', (ctx) => {
    const welcomeMessage = `Welcome to CryptoTrendBot! 🤖
I track crypto market trends using AI.

Here are the commands you can use:
/subscribe <COIN> - Get trend updates for a coin (e.g., /subscribe BTC).
/unsubscribe <COIN> - Stop getting updates for a coin.
/list - See your current subscriptions.
/help - Show this message again.`;
    ctx.reply(welcomeMessage);
  });

  bot.command('help', (ctx) => {
    const helpMessage = `Here are the commands you can use:
/subscribe <COIN> - Get trend updates for a coin (e.g., /subscribe BTC).
/unsubscribe <COIN> - Stop getting updates for a coin.
/list - See your current subscriptions.
/help - Show this message again.`;
    ctx.reply(helpMessage);
  });

  bot.command('subscribe', (ctx) => {
    const coin = ctx.match.trim().toUpperCase();
    if (!coin) {
      return ctx.reply(
        'Please specify a coin symbol. Usage: /subscribe <COIN>'
      );
    }
    if (!ctx.chat?.id) return;
    addSubscription(ctx.chat.id, coin);
    ctx.reply(`✅ Subscribed to ${coin}! You'll now receive trend updates.`);
  });

  bot.command('unsubscribe', (ctx) => {
    const coin = ctx.match.trim().toUpperCase();
    if (!coin) {
      return ctx.reply(
        'Please specify a coin symbol. Usage: /unsubscribe <COIN>'
      );
    }
    if (!ctx.chat?.id) return;
    removeSubscription(ctx.chat.id, coin);
    ctx.reply(`🚫 Unsubscribed from ${coin}.`);
  });

  bot.command('list', (ctx) => {
    if (!ctx.chat?.id) return;
    const subscriptions = getSubscriptions(ctx.chat.id);
    if (subscriptions.length === 0) {
      return ctx.reply(
        'You are not subscribed to any coins yet. Use /subscribe <COIN> to start.'
      );
    }
    ctx.reply(`Your current subscriptions:\n- ${subscriptions.join('\n- ')}`);
  });
};
