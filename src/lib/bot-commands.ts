import type { Bot, Context } from 'grammy';
import { InlineKeyboard } from 'grammy';
import {
  addSubscription,
  getSubscriptions,
  removeSubscription,
} from '@/lib/subscriptions';
import { getCandlestickData, getCryptoData } from './gemini-api';
import { analyzeCryptoTrend } from '@/ai/flows/analyze-crypto-trend';
import { advancedCryptoAnalyzer } from '@/ai/flows/advanced-crypto-analyzer';

// Reusable function to perform analysis and reply
async function performAnalysis(ctx: Context, coin: string) {
  try {
    // Acknowledge the interaction first
    if (ctx.callbackQuery) {
      await ctx.answerCallbackQuery({ text: `Analyzing ${coin}...` });
    } else {
      await ctx.reply(`Analyzing ${coin}...`);
    }

    // 1. Fetch market data
    const marketData = await getCryptoData(coin);
    if (!marketData) {
      await ctx.reply(
        `Could not fetch market data for ${coin}. Please make sure it's a valid symbol.`
      );
      return;
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

    const message = `${trendEmoji} *AI Analysis for ${coin}*

*Trend*: ${analysis.trend}
*Reason*: ${analysis.reason}
*Confidence*: ${Math.round(analysis.confidence * 100)}%`;

    // Use editMessageText if it's a callback query to avoid clutter
    if (ctx.callbackQuery) {
        await ctx.editMessageText(message, { parse_mode: 'Markdown' });
    } else {
        await ctx.reply(message, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    console.error(`Error in analysis for ${coin}:`, error);
    await ctx.reply(`Sorry, an error occurred while analyzing ${coin}.`);
  }
}

export const setupCommands = (bot: Bot) => {
  const popularCoins = ['BTC', 'ETH', 'SOL', 'DOGE','BNB','LTC','LINK','DOGE'];
  const analyzeKeyboard = new InlineKeyboard();
  popularCoins.forEach((coin) => {
    analyzeKeyboard.text(`Analyze ${coin}`, `analyze_${coin}`).row();
  });

  const welcomeMessage = `Welcome to CryptoTrendBot! 🤖
I track crypto market trends using AI.

Here are the commands you can use:
/subscribe <COIN> - Get trend updates for a coin (e.g., /subscribe BTC).
/unsubscribe <COIN> - Stop getting updates for a coin.
/list - See your current subscriptions.
/analyze <COIN> - Get an instant AI analysis for a coin.
/advanced_analyze <COIN> - Get a detailed, multi-timeframe analysis (5m, 15m, 1hr, 6hr).
/help - Show this message again.

Or use the buttons below for a quick analysis:`;

  bot.command('start', (ctx) => {
    ctx.reply(welcomeMessage, {
      reply_markup: analyzeKeyboard,
    });
  });

  bot.command('help', (ctx) => {
    ctx.reply(welcomeMessage, {
      reply_markup: analyzeKeyboard,
    });
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
      await ctx.reply(
        'Please specify a coin symbol. Usage: /analyze <COIN>'
      );
      return;
    }
    await performAnalysis(ctx, coin);
    return;
  });

  bot.command('advanced_analyze', async (ctx) => {
    const coin = ctx.match.trim().toUpperCase();

    if (!coin) {
      await ctx.reply(
        'Please specify a coin symbol. Usage: /advanced_analyze <COIN>'
      );
      return;
    }

    await ctx.reply(`🔬 Performing multi-timeframe analysis for ${coin}. This may take a moment...`);

    const timeframes = ['5m', '15m', '1hr', '6hr'];

    try {
      const analyses = await Promise.all(
        timeframes.map(async (timeframe) => {
          const candlestickData = await getCandlestickData(coin, timeframe);
          if (!candlestickData || candlestickData.length === 0) {
            return `Could not fetch candlestick data for timeframe ${timeframe}.`;
          }
          const analysis = await advancedCryptoAnalyzer({
            cryptoSymbol: coin,
            timeframe: timeframe,
            candlestickData: JSON.stringify(candlestickData),
          });
          return { timeframe, analysis };
        })
      );

      let finalReport = `*🔍 Advanced Multi-Timeframe Analysis for ${coin}*\n\n`;

      for (const result of analyses) {
        if (typeof result === 'string') {
          finalReport += `*Timeframe: N/A*\n${result}\n\n`;
          continue;
        }

        const { timeframe, analysis } = result;

        const trendEmoji = {
          'strong bullish': '🚀',
          bullish: '📈',
          neutral: '📊',
          bearish: '📉',
          'strong bearish': '🚨',
        }[analysis.trend];

        finalReport += `*====== ${timeframe.toUpperCase()} Analysis ======*\n`;
        finalReport += `*Trend:* ${analysis.trend} ${trendEmoji}\n`;
        finalReport += `*Recommendation:* ${analysis.aiRecommendation}\n`;
        finalReport += `*Prediction:* ${analysis.pricePrediction}\n`;
        finalReport += `*Summary:* ${analysis.reasoningSummary}\n\n`;
      }

      await ctx.reply(finalReport, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error(`Error in advanced multi-timeframe analysis for ${coin}:`, error);
      await ctx.reply(`Sorry, an error occurred during the advanced analysis of ${coin}.`);
    }
    return;
  });


  // Handle inline keyboard button clicks for analysis
  bot.callbackQuery(/analyze_(.+)/, async (ctx) => {
    const coin = ctx.match[1];
    if (coin) {
      await performAnalysis(ctx, coin);
    }
    return;
  });
};
