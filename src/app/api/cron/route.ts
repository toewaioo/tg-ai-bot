import { NextResponse } from 'next/server';
import { analyzeCryptoTrend } from '@/ai/flows/analyze-crypto-trend';
import { bot } from '@/lib/bot-instance';
import { getCryptoData } from '@/lib/gemini-api';
import { getAllSubscriptions, getAllUniqueCoins } from '@/lib/subscriptions';
import { getLastTrend, setLastTrend } from '@/lib/trends';

export const dynamic = 'force-dynamic'; // Ensures the route is not cached

// This function is triggered by the Vercel Cron Job
export async function GET() {
  console.log('Cron job started: Analyzing crypto trends.');

  const uniqueCoins = getAllUniqueCoins();
  if (uniqueCoins.length === 0) {
    console.log('No subscriptions found. Skipping analysis.');
    return NextResponse.json({ status: 'ok', message: 'No subscriptions' });
  }

  const allSubscriptions = getAllSubscriptions();

  for (const coin of uniqueCoins) {
    try {
      // 1. Fetch market data from Gemini Exchange
      const marketData = await getCryptoData(coin);
      if (!marketData) {
        console.warn(`Could not fetch data for ${coin}.`);
        continue;
      }

      // 2. Analyze trend with Genkit AI flow
      const analysis = await analyzeCryptoTrend({
        cryptoSymbol: coin,
        marketData: JSON.stringify(marketData),
      });

      const currentTrend = analysis.trend;
      const lastTrend = getLastTrend(coin);

      console.log(
        `Analyzed ${coin}: Last trend was '${lastTrend}', current trend is '${currentTrend}'.`
      );

      // 3. Compare with last trend and notify if it has changed
      if (lastTrend && currentTrend !== lastTrend) {
        console.log(
          `Trend changed for ${coin} to ${currentTrend}. Notifying subscribers.`
        );

        // Find all users subscribed to this coin
        const subscriberChatIds = Object.entries(allSubscriptions)
          .filter(([_, { subscriptions }]) => subscriptions.includes(coin))
          .map(([chatId]) => Number(chatId));

        if (subscriberChatIds.length > 0) {
          const trendEmoji =
            currentTrend === 'bullish'
              ? '📈'
              : currentTrend === 'bearish'
              ? '📉'
              : '📊';
          const message = `${trendEmoji} Trend Alert for ${coin}! The market is now looking ${currentTrend}.

Reason: ${analysis.reason}`;

          // 4. Send notifications via Telegram
          for (const chatId of subscriberChatIds) {
            await bot.api.sendMessage(chatId, message).catch(console.error);
          }
        }
      }
      
      // 5. Update the last known trend
      setLastTrend(coin, currentTrend);

    } catch (error) {
      console.error(`Error processing trend for ${coin}:`, error);
    }
  }

  console.log('Cron job finished.');
  return NextResponse.json({ status: 'ok' });
}
