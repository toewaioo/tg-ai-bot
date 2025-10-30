import type { Bot } from 'grammy';
import {
  addSubscription,
  getSubscriptions,
  removeSubscription,
} from '@/lib/subscriptions';
import { getCryptoData } from './gemini-api';
import { analyzeCryptoTrend } from '@/ai/flows/analyze-crypto-trend';

export const setupCommands = (bot: Bot) => {
  bot.command('start', (ctx) => {
    const welcomeMessage = `Welcome to CryptoTrendBot! 🤖
I track crypto market trends using AI.

Here are the commands you can use:
/subscribe <COIN> - Get trend updates for a coin (e.g., /subscribe BTC).
/unsubscribe <COIN> - Stop getting updates for a coin.
/list - See your current subscriptions.
/analyze <COIN> - Get an instant AI analysis for a coin.
/help - Show this message again.`;
    ctx.reply(welcomeMessage);
  });

  bot.command('help', (ctx) => {
    const helpMessage = `Here are the commands you can use:
/subscribe <COIN> - Get trend updates for a coin (e.g., /subscribe BTC).
/unsubscribe <COIN> - Stop getting updates for a coin.
/list - See your current subscriptions.
/analyze <COIN> - Get an instant AI analysis for a coin.
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

  bot.command('analyze', async (ctx) => {
    const coin = ctx.match.trim().toUpperCase();
    if (!coin) {
      return ctx.reply(
        'Please specify a coin symbol. Usage: /analyze <COIN>'
      );
    }

    try {
      await ctx.reply(`Analyzing ${coin}...`);

      // 1. Fetch market data
      const marketData = await getCryptoData(coin);
      if (!marketData) {
        return ctx.reply(`Could not fetch market data for ${coin}. Please make sure it's a valid symbol.`);
      }

      // 2. Analyze trend with Genkit AI flow
      const analysis = await analyzeCryptoTrend({
        cryptoSymbol: coin,
        marketData: JSON.stringify(marketData),
      });

      // 3. Send the result to the user
      const trendEmoji =
        analysis.trend === 'bullish'
          ? '📈'
          : analysis.trend === 'bearish'
          ? '📉'
          : '📊';
          
      const message = `${trendEmoji} AI Analysis for ${coin}: The market is looking ${analysis.trend}.

Reason: ${analysis.reason}
Confidence: ${Math.round(analysis.confidence * 100)}%`;

      await ctx.reply(message);

    } catch (error) {
      console.error(`Error in /analyze command for ${coin}:`, error);
      await ctx.reply(`Sorry, an error occurred while analyzing ${coin}.`);
    }
  });
};
