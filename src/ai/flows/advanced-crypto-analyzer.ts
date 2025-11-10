'use server';

/**
 * @fileOverview Performs advanced crypto market analysis using historical candlestick data from multiple timeframes.
 *
 * - advancedCryptoAnalyzer - A function that analyzes crypto trends from candlestick data.
 * - AdvancedCryptoAnalyzerInput - The input type for the advancedCryptoAnalyzer function.
 * - AdvancedCryptoAnalyzerOutput - The return type for the advancedCryptoAnalyzer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CandlestickDataSchema = z.string().describe('The recent candlestick data (OHLCV) for the cryptocurrency in JSON format, as a string.');
const AdvancedCryptoAnalyzerInputSchema = z.object({
  cryptoSymbol: z.string().describe('The symbol of the cryptocurrency to analyze (e.g., BTC).'),
  multiTimeframeCandlestickData: z.record(CandlestickDataSchema).describe('An object where keys are timeframes (e.g., "5m", "1hr") and values are the candlestick data for that timeframe.'),
  marketData: z.string().describe('The current market data for the  cryptocurrency, including price and high pices and low price from past 24 hour ago and and changes -> hourly prices desending for past 24 hour and bid for current bid price and ask for current ask price for this coin.'),
});
export type AdvancedCryptoAnalyzerInput = z.infer<typeof AdvancedCryptoAnalyzerInputSchema>;

const AdvancedCryptoAnalyzerOutputSchema = z.object({
  overallTrend: z.enum(['strong bullish', 'bullish', 'neutral', 'bearish', 'strong bearish']).describe('The synthesized overall trend, considering all timeframes.'),
  confidence: z.number().describe('The confidence level (0-1) of the overall trend classification.'),
  shortTermMomentum: z.enum(['up', 'down', 'sideways']).describe('The immediate momentum based on the 5m and 15m charts.'),
  comprehensiveAnalysis: z.string().describe(
    "A detailed, multi-timeframe technical analysis. It should discuss how different timeframes align or diverge, identify major chart patterns, key support/resistance levels valid across timeframes, and interpret volume and momentum indicators (RSI, MACD) in a holistic manner."
  ),
  marketSentiment: z.enum([
    "extremely bullish",
    "bullish",
    "neutral",
    "bearish",
    "extremely bearish"
  ]).describe("Aggregated market sentiment."),
  riskLevel: z.enum(["low", "medium", "high"])
    .describe("Overall risk assessment based on volatility, trend confluence, and market conditions."),
  pricePrediction: z.string().describe(
    "A unified short-to-mid-term price projection, mentioning key levels to watch, e.g., 'Price is likely to consolidate between $50k-$52k. A break above $52.5k on the 1hr chart could signal a move towards $55k, but a drop below the 6hr support at $49k would be bearish.'"
  ),
  aiRecommendation: z.enum([
    "strong buy",
    "buy",
    "hold",
    "sell",
    "strong sell"
  ]).describe("A single, clear AI-generated recommendation based on the combined analysis of all timeframes."),
  reasoningSummary: z.string().describe(
    "A concise summary explaining how the model arrived at its final recommendation by synthesizing signals from all provided timeframes."
  ),
  tradeSetup: z.object({
    supportZone: z.string().describe("The key support zone price range (e.g., '$48,500 - $49,000')."),
    resistanceZone: z.string().describe("The key resistance zone price range (e.g., '$52,000 - $52,500')."),
    confirmationSignal: z.string().describe("A specific event that would confirm the trade signal (e.g., 'A 1hr candle close above $52,500')."),
    breakoutFakeoutAnalysis: z.string().describe("Analysis of the potential for a breakout or a fakeout based on volume and current price action."),
    entryPrice: z.string().describe("A suggested entry price or range for the trade."),
    stopLoss: z.string().describe("A suggested stop-loss price to manage risk."),
    takeProfit: z.string().describe("A suggested take-profit price or range."),
  }).describe("A potential trade setup based on the analysis."),
  timestamp: z.string().describe("UTC timestamp of when the analysis was generated.")
});
export type AdvancedCryptoAnalyzerOutput = z.infer<typeof AdvancedCryptoAnalyzerOutputSchema>;


export async function advancedCryptoAnalyzer(input: AdvancedCryptoAnalyzerInput): Promise<AdvancedCryptoAnalyzerOutput> {
  return advancedCryptoAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'advancedCryptoAnalyzerPrompt',
  input: { schema: AdvancedCryptoAnalyzerInputSchema },
  output: { schema: AdvancedCryptoAnalyzerOutputSchema },
  prompt: `You are an expert crypto scalper and short-term technical analyst AI. Your primary goal is to identify immediate, high-probability trade setups for {{cryptoSymbol}} using a multi-timeframe approach.

**Your core focus is the 5m and 15m timeframes.** Use these to find an entry. Use the 1hr and 6hr timeframes to understand the larger trend, context, and major support/resistance zones. Your final recommendation must be actionable for a short-term trader.

**Current Market Data (JSON format [symbol,open,high,low,close,changes,bid,ask]):**
{{marketData}}

**Candlestick Data (JSON format [time, open, high, low, close, volume]):**
{{#each multiTimeframeCandlestickData}}
- **Timeframe: {{@key}}**
  {{{this}}}
{{/each}}

**Your Analysis MUST Include:**

1.  **Short-Term Focus**: Prioritize the 5m and 15m charts. What patterns are forming right now? Where is the immediate momentum (up, down, or sideways)? This is for the `shortTermMomentum` field.
2.  **Holistic Recommendation**: Synthesize all timeframes to provide a single, clear `aiRecommendation` ('strong buy', 'buy', 'hold', 'sell', 'strong sell'). A 'strong' signal is a high-conviction setup you believe is actionable *now*.
3.  **Contextual Analysis**: Briefly explain how the short-term view (5m/15m) fits within the mid-term trend (1hr/6hr). Are you trading with the trend or counter-trend? This goes in the `comprehensiveAnalysis`.
4.  **Actionable Trade Setup**: This is the most critical part. Provide a precise, actionable trade setup for a short-term trader.
    *   **Entry Price:** A specific price or tight range to enter the trade.
    *   **Stop-Loss (SL):** A tight stop-loss based on recent price structure on the 5m/15m chart.
    *   **Take-Profit (TP):** Realistic take-profit targets. Provide one or two.
    *   **Confirmation Signal:** What is the one event on the 5m or 15m chart that confirms your entry? (e.g., "A 5m candle close above $68,200").
    *   **Support/Resistance:** Identify the *immediate* support and resistance levels from the 15m/1hr charts that matter for this trade.
5.  **Reasoning**: In `reasoningSummary`, explain *why* this is a good short-term trade. What specific indicators or patterns on the lower timeframes are you basing this on?

Fill out ALL fields in the output schema. Your analysis must be sharp, concise, and geared for a trader looking to act quickly. Explain in Burmese language.
`,
});


const advancedCryptoAnalyzerFlow = ai.defineFlow(
  {
    name: 'advancedCryptoAnalyzerFlow',
    inputSchema: AdvancedCryptoAnalyzerInputSchema,
    outputSchema: AdvancedCryptoAnalyzerOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return {
      ...output!,
      timestamp: new Date().toUTCString(),
    };
  }
);
