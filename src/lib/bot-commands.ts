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
/advanced_analyze <COIN> <TIMEFRAME> - Get a detailed analysis based on historical data.
  └─ Timeframes: 1m, 5m, 15m, 30m, 1hr, 6hr, 1day
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
    const parts = ctx.match.trim().split(' ');
    const coin = parts[0]?.toUpperCase();
    const timeframe = parts[1];

    if (!coin || !timeframe) {
      await ctx.reply(
        'Please specify a coin and a timeframe. Usage: /advanced_analyze <COIN> <TIMEFRAME>'
      );
      return;
    }
    
    const validTimeframes = ['1m', '5m', '15m', '30m', '1hr', '6hr', '1day'];
    if (!validTimeframes.includes(timeframe)) {
       await ctx.reply(
        `Invalid timeframe. Please use one of: ${validTimeframes.join(', ')}`
      );
       return;
    }
    
    await ctx.reply(`🔬 Performing advanced analysis for ${coin} on the ${timeframe} timeframe. This may take a moment...`);
    let candlestickData;
    let analysis;
    try {
        candlestickData = await getCandlestickData(coin, timeframe);
        if (!candlestickData || candlestickData.length === 0) {
            await ctx.reply(`Could not fetch candlestick data for ${coin} on the ${timeframe} timeframe.`);
            return;
        }
      } catch (err) {
        console.error(err);
        await ctx.reply(`⚠️ Failed to fetch candlestick data. Please try again later.`);
        return; // stop command
    }
    try {
         analysis = await advancedCryptoAnalyzer({
            cryptoSymbol: coin,
            timeframe: timeframe,
            candlestickData: JSON.stringify(candlestickData),
        });

        const trendEmoji = {
            'strong bullish': '🚀',
            'bullish': '📈',
            'neutral': '📊',
            'bearish': '📉',
            'strong bearish': '🚨'
        }[analysis.trend];
        const indicatorsText = analysis.indicators
        ? `*📊 Indicators:*
RSI: ${analysis.indicators.rsi ?? 'N/A'}
MACD: ${analysis.indicators.macd ?? 'N/A'}
EMA Short: ${analysis.indicators.emaShort ?? 'N/A'}
EMA Long: ${analysis.indicators.emaLong ?? 'N/A'}
Volume Trend: ${analysis.indicators.volumeTrend ?? 'N/A'}`
        : '';
        const escapeMarkdown = (text: string) =>
          text.replace(/([*_`\[\]()~>#+\-=|{}.!])/g, '\\$1');
        const message = `
*${trendEmoji} Advanced AI Analysis: ${coin} (${timeframe})*
-------------------------------------------------
*Overall Trend:* ${analysis.trend}
*Confidence:* ${Math.round(analysis.confidence * 100)}%
-------------------------------------------------
*Overall Trend:* ${analysis.trend}
*Confidence:* ${Math.round(analysis.confidence * 100)}%
*Market Sentiment:* ${analysis.marketSentiment}
*Volatility Level:* ${analysis.volatilityLevel}
*Risk Level:* ${analysis.riskLevel}
*AI Recommendation:* ${analysis.aiRecommendation}
---------------------------------------------------
${indicatorsText ? escapeMarkdown(indicatorsText) : ''}
---------------------------------------------------
*🔮 Short-Term Prediction:*
${analysis.pricePrediction}

*🧠 Detailed Analysis:*
${analysis.analysis.replace(/([*_`\[\]()~>#+\-=|{}.!])/g, '\\$1')}
`;

        await ctx.reply(message, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error(`Error in advanced analysis for ${coin}:`, error);
        await ctx.reply(`Sorry, an error occurred during the advanced analysis of ${coin}.`);
        return;
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
