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
  popularCoins.forEach((coin, index) => {
    analyzeKeyboard.text(`Analyze ${coin}`, `analyze_${coin}`);
    if ((index + 1) % 2 === 0) {
      analyzeKeyboard.row();
    }
  });


  const welcomeMessage = `Welcome to your AI Crypto Trading Assistant! 🤖

I constantly watch the market and will automatically send you a notification when my AI analysis identifies a *strong buy* or *strong sell* signal for a coin you are subscribed to.

*Commands:*
/subscribe <COIN> - Get signal notifications for a coin (e.g., /subscribe BTC).
/unsubscribe <COIN> - Stop getting notifications.
/list - See your current subscriptions.
/analyze <COIN> - Get an instant AI analysis for a coin.
/advanced_analyze <COIN> - Get a detailed, multi-timeframe analysis report.
/help - Show this message again.

*Quick Analysis:*
Use the buttons below for a quick analysis of popular coins.

*Disclaimer*: This is an AI-powered tool and its analysis is for informational purposes only. It is not financial advice. All trading involves risk. Please do your own research.`;

  bot.command('start', (ctx) => {
    ctx.reply(welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: analyzeKeyboard,
    });
  });

  bot.command('help', (ctx) => {
    ctx.reply(welcomeMessage, {
      parse_mode: 'Markdown',
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
    ctx.reply(`✅ Subscribed to ${coin}! You'll now receive strong buy/sell signals.`);
    return;
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
    return;
  });

  bot.command('list', (ctx) => {
    if (!ctx.chat?.id) return;
    const subscriptions = getSubscriptions(ctx.chat.id);
    if (subscriptions.length === 0) {
      return ctx.reply(
        'You are not subscribed to any coins yet. Use /subscribe <COIN> to start getting signals.'
      );
    }
    ctx.reply(`Your current subscriptions:\n- ${subscriptions.join('\n- ')}`);
    return;
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
        await ctx.reply('Please specify a coin symbol. Usage: /advanced_analyze <COIN>');
        return;
    }

    await ctx.reply(`🔬 Performing comprehensive multi-timeframe analysis for ${coin}. This may take a moment...`);

    const timeframes = ['5m', '15m', '1hr', '6hr'];

    try {
        // 1. Fetch all candlestick data in parallel
        const candlestickDataPromises = timeframes.map(timeframe =>
            getCandlestickData(coin, timeframe).then(data => ({ timeframe, data }))
        );
        const allCandlestickData = await Promise.all(candlestickDataPromises);

        const multiTimeframeCandlestickData: Record<string, string> = {};
        let hasData = false;
        
        for (const { timeframe, data } of allCandlestickData) {
            if (data && data.length > 0) {
                multiTimeframeCandlestickData[timeframe] = JSON.stringify(data);
                hasData = true;
            } else {
                console.warn(`No candlestick data for ${coin} on timeframe ${timeframe}`);
            }
        }

        if (!hasData) {
            await ctx.reply(`Could not fetch any historical data for ${coin}. Please check the symbol.`);
            return;
        }

        // 2. Make a single AI request with all the data
        const analysis = await advancedCryptoAnalyzer({
            cryptoSymbol: coin,
            multiTimeframeCandlestickData: multiTimeframeCandlestickData,
        });
        
        // 3. Format and send the final report
        const trendEmoji = {
          'strong bullish': '🚀',
          bullish: '📈',
          neutral: '📊',
          bearish: '📉',
          'strong bearish': '🚨',
        }[analysis.overallTrend];

        let finalReport = `*🔍 Comprehensive AI Analysis for ${coin}*\n\n`;
        finalReport += `*Overall Recommendation:* *${analysis.aiRecommendation.toUpperCase()}* ${trendEmoji}\n\n`;
        finalReport += `*Summary:*\n${analysis.reasoningSummary}\n\n`;
        finalReport += `*Detailed Analysis:*\n${analysis.comprehensiveAnalysis}\n\n`;
        finalReport += `*Price Prediction:*\n${analysis.pricePrediction}\n\n`;
        finalReport += `*Market Sentiment:* ${analysis.marketSentiment}\n`;
        finalReport += `*Risk Level:* ${analysis.riskLevel}\n`;
        finalReport += `*Confidence:* ${Math.round(analysis.confidence * 100)}%\n\n`;
        finalReport += `_Analysis generated at ${analysis.timestamp}_`;

        await ctx.reply(finalReport, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error(`Error in advanced multi-timeframe analysis for ${coin}:`, error);
        await ctx.reply(`Sorry, a critical error occurred during the advanced analysis of ${coin}.`);
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
