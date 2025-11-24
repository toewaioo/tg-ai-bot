
import { NextResponse } from 'next/server';
import { advancedCryptoAnalyzer } from '@/ai/flows/advanced-crypto-analyzer';
import { bot } from '@/lib/bot-instance';
import { getCandlestickData, getCryptoData } from '@/lib/gemini-api';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('Cron job started: Analyzing crypto signals.');

  const uniqueCoins = ['SOL'];
  if (uniqueCoins.length === 0) {
    console.log('No coins to analyze. Skipping.');
    return NextResponse.json({ status: 'ok', message: 'No coins to analyze' });
  }

  const adminChatId = -1002933829;

  for (const coin of uniqueCoins) {
    try {
      // 1. Fetch market and candlestick data
      const timeframes = ['5m', '15m', '30m', '1hr', '6hr'];
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
        continue; // Skip to the next coin
      }

      const marketData = await getCryptoData(coin);
      if (!marketData) {
        console.warn(`Could not fetch market data for ${coin}.`);
        continue; // Skip to the next coin
      }
      
      // 2. Fetch recent signals from Supabase to provide to the AI
      const { data: previousSignals, error: dbError } = await supabase
        .from('signals')
        .select('*')
        .eq('coin_symbol', coin)
        .order('timestamp', { ascending: false })
        .limit(5);

      if (dbError) {
        console.error(`Supabase error fetching signals for ${coin}:`, dbError);
      }

      // 3. Analyze trend with the advanced AI flow
      const analysis = await advancedCryptoAnalyzer({
        cryptoSymbol: coin,
        multiTimeframeCandlestickData,
        marketData: JSON.stringify(marketData),
        previousSignals: previousSignals ? JSON.stringify(previousSignals) : undefined,
      });

      // 4. Save the new signal to Supabase
      const { error: insertError } = await supabase.from('signals').insert({
        coin_symbol: coin,
        signal: analysis.aiRecommendation,
        details: analysis, // Store the full analysis object
        timestamp: analysis.timestamp,
      });

      if (insertError) {
        console.error(`Supabase insert error for ${coin}:`, insertError);
      }

      const currentSignal = analysis.aiRecommendation;
      const lastSignal = previousSignals?.[0]?.signal;

      console.log(`Analyzed ${coin}: Last signal was '${lastSignal}', current signal is '${currentSignal}'.`);

      // 5. Notify only on strong, changed signals
      const isStrongSignal = currentSignal === 'strong buy' || currentSignal === 'strong sell';
      if (isStrongSignal && currentSignal !== lastSignal) {
        console.log(`Strong signal change for ${coin} to ${currentSignal}. Notifying admin.`);

        const signalEmoji = currentSignal === 'strong buy' ? '🟢' : '🔴';
        const { tradeSetup } = analysis;

        const message = `
${signalEmoji} *${coin} Trading Signal: ${currentSignal.toUpperCase()}*

*Trade Setup:*
- *Entry Price:* ${tradeSetup.entryPrice}
- *Stop-Loss (SL):* ${tradeSetup.stopLoss}
- *Take-Profit (TP):* ${tradeSetup.takeProfit}

*Key Levels:*
- *Support Zone:* ${tradeSetup.supportZone}
- *Resistance Zone:* ${tradeSetup.resistanceZone}

*Reasoning*: ${analysis.reasoningSummary}

*Confirmation Signal to Enter:*
${tradeSetup.confirmationSignal}

*Disclaimer: This is not financial advice. Trade at your own risk.*`;

        await bot.api.sendMessage(adminChatId, message, { parse_mode: 'Markdown' }).catch(console.error);
      }
    } catch (error) {
      console.error(`Error processing signal for ${coin}:`, error);
    }
  }

  console.log('Cron job finished.');
  return NextResponse.json({ status: 'ok' });
}
