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
  prompt: `You are an expert financial analyst and AI advisor for the cryptocurrency markets. Your main goal is to identify strong trading signals and provide a complete trade setup. Your task is to perform a comprehensive, multi-timeframe analysis for {{cryptoSymbol}} based on the candlestick  and current {{marketData}} data provided.

Your analysis must be holistic. Synthesize the information from all timeframes to provide a single, unified assessment. Do not just analyze each timeframe in isolation.
**Current Market Data Json format[symbol,open,high,low,close,changes,bid,ask](The current market data for the  cryptocurrency, including price and high pices and low price from past 24 hour ago and and changes -> hourly prices desending for past 24 hour and bid for current bid price and ask for current ask price for this coin.):**\n
{{marketData}}
\n
**Candlestick Data (JSON format [time, open, high, low, close, volume]):**
{{#each multiTimeframeCandlestickData}}
- **Timeframe: {{@key}}**
  {{{this}}}
{{/each}}


**Your analysis MUST include the following:**

1.  **High-Level Summary**: Provide an overall trend, confidence score, market sentiment, risk level, and a concise price prediction.
2.  **AI Recommendation**: Based on everything, provide one clear, actionable recommendation: 'strong buy', 'buy', 'hold', 'sell', or 'strong sell'. A 'strong' signal indicates a high-conviction opportunity.
3.  **Comprehensive Analysis**: Discuss your findings in detail. How do short-term patterns fit into the larger structure? Identify major chart patterns, support/resistance, volume trends, and momentum indicators (RSI, MACD) in a multi-timeframe context.
4.  **Actionable Trade Setup**: This is critical. Provide a specific and actionable trade setup.
    *   **Support & Resistance:** Identify the most immediate and critical support and resistance zones.
    *   **Confirmation Signal:** What specific event would confirm your AI recommendation? (e.g., "A 4hr candle close above $52,500").
    *   **Breakout/Fakeout:** Briefly analyze the potential for a breakout or fakeout. Look at volume and recent price action near key levels.
    *   **Entry Price:** Suggest a specific entry price or a narrow range.
    *   **Stop-Loss (SL):** Provide a clear stop-loss price to protect against a loss.
    *   **Take-Profit (TP):** Suggest a realistic take-profit target.
5.  **Reasoning Summary**: Briefly summarize how you weighed the different timeframes and indicators to arrive at your final recommendation and trade setup.

Fill out ALL fields in the output schema with your detailed, synthesized analysis.Explain to burmese language.
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
