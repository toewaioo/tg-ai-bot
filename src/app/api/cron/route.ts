
import { NextResponse } from 'next/server';
import { advancedCryptoAnalyzer } from '@/ai/flows/advanced-crypto-analyzer';
import { bot } from '@/lib/bot-instance';
import { getAllUniqueCoins } from '@/lib/subscriptions';
import { getCandlestickData } from '@/lib/gemini-api';
import { getLastTrend, setLastTrend } from '@/lib/trends';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('Cron job started: Analyzing crypto signals.');

  const uniqueCoins = ['SOL'];
  if (uniqueCoins.length === 0) {
    console.log('No subscriptions found. Skipping analysis.');
    return NextResponse.json({ status: 'ok', message: 'No subscriptions' });
  }

  const adminChatId = -1002933829;

  for (const coin of uniqueCoins) {
    try {
      // 1. Fetch candlestick data for multiple timeframes
      const timeframes = ['5m', '15m', '1hr', '6hr'];
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
          }
      }

      if (!hasData) {
        console.warn(`Could not fetch any candlestick data for ${coin}.`);
        continue;
      }

      // 2. Analyze trend with the advanced AI flow
      const analysis = await advancedCryptoAnalyzer({
        cryptoSymbol: coin,
        multiTimeframeCandlestickData,
      });

      const currentSignal = analysis.aiRecommendation;
      const lastSignal = getLastTrend(coin);

      console.log(`Analyzed ${coin}: Last signal was '${lastSignal}', current signal is '${currentSignal}'.`);

      // 3. Notify only on strong, changed signals
      const isStrongSignal = currentSignal === 'strong buy' || currentSignal === 'strong sell';
      if (isStrongSignal && currentSignal !== lastSignal) {
        console.log(`Strong signal change for ${coin} to ${currentSignal}. Notifying admin.`);

        const signalEmoji = currentSignal === 'strong buy' ? '🟢' : '🔴';
        const { tradeSetup } = analysis;

        const message = `
${signalEmoji} *${coin} Trading Signal: ${currentSignal.toUpperCase()}*

*Reasoning*: ${analysis.reasoningSummary}

*Trade Setup:*
- *Entry Price:* ${tradeSetup.entryPrice}
- *Stop-Loss (SL):* ${tradeSetup.stopLoss}
- *Take-Profit (TP):* ${tradeSetup.takeProfit}

*Key Levels:*
- *Support Zone:* ${tradeSetup.supportZone}
- *Resistance Zone:* ${tradeSetup.resistanceZone}

*Disclaimer: This is not financial advice. Trade at your own risk.*`;

          await bot.api.sendMessage(adminChatId, message, { parse_mode: 'Markdown' }).catch(console.error);
      }
      
      // 4. Update the last known signal
      setLastTrend(coin, currentSignal);

    } catch (error) {
      console.error(`Error processing signal for ${coin}:`, error);
    }
  }

  console.log('Cron job finished.');
  return NextResponse.json({ status: 'ok' });
}
