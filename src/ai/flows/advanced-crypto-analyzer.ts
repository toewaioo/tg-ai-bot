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
});
export type AdvancedCryptoAnalyzerInput = z.infer<typeof AdvancedCryptoAnalyzerInputSchema>;

const AdvancedCryptoAnalyzerOutputSchema = z.object({
  overallTrend: z.enum(['strong bullish', 'bullish', 'neutral', 'bearish', 'strong bearish']).describe('The synthesized overall trend, considering all timeframes.'),
  confidence: z.number().describe('The confidence level (0-1) of the overall trend classification.'),
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
  prompt: `You are an expert technical analyst for cryptocurrency markets. Your task is to perform a comprehensive, multi-timeframe analysis for {{cryptoSymbol}} based on the candlestick data provided for various timeframes.

Your analysis must be holistic. Synthesize the information from all timeframes to provide a single, unified assessment. Do not just analyze each timeframe in isolation.

**Candlestick Data (JSON format [time, open, high, low, close, volume]):**
{{#each multiTimeframeCandlestickData}}
- **Timeframe: {{@key}}**
  {{{this}}}
{{/each}}

**Your analysis must cover:**
1.  **Overall Trend Identification**: Based on the confluence or divergence of trends across the timeframes, classify the *overall* current trend. For example, if short timeframes are bullish but long timeframes are bearish, you might classify it as 'neutral' or 'bullish with caution'.
2.  **Comprehensive Analysis**: In this main section, discuss your findings. How do the short-term patterns on the 5m and 15m charts fit into the larger structure of the 1hr and 6hr charts? Identify major support/resistance levels that are respected across multiple timeframes. Discuss volume trends and momentum indicators (RSI, MACD) in this multi-timeframe context.
3.  **Market Sentiment, Risk, and Price Prediction**: Provide a single assessment for each of these, derived from your combined analysis.
4.  **A Single AI Recommendation**: Based on everything, provide one clear recommendation: 'strong buy', 'buy', 'hold', 'sell', or 'strong sell'.
5.  **Concise Reasoning**: Briefly summarize how you weighed the different timeframes to arrive at your final recommendation.

Fill out all fields in the output schema with your detailed, synthesized analysis.
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
