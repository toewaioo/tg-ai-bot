'use server';

/**
 * @fileOverview Performs advanced crypto market analysis using historical candlestick data.
 *
 * - advancedCryptoAnalyzer - A function that analyzes crypto trends from candlestick data.
 * - AdvancedCryptoAnalyzerInput - The input type for the advancedCryptoAnalyzer function.
 * - AdvancedCryptoAnalyzerOutput - The return type for the advancedCryptoAnalyzer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdvancedCryptoAnalyzerInputSchema = z.object({
  cryptoSymbol: z.string().describe('The symbol of the cryptocurrency to analyze (e.g., BTC).'),
  timeframe: z.string().describe('The timeframe for the candlestick data (e.g., 1hr, 1day).'),
  candlestickData: z.string().describe('The recent candlestick data (OHLCV) for the cryptocurrency in JSON format.'),
});
export type AdvancedCryptoAnalyzerInput = z.infer<typeof AdvancedCryptoAnalyzerInputSchema>;

const AdvancedCryptoAnalyzerOutputSchema = z.object({
  trend: z.enum(['strong bullish', 'bullish', 'neutral', 'bearish', 'strong bearish']).describe('The classified trend of the cryptocurrency.'),
  confidence: z.number().describe('The confidence level (0-1) of the trend classification.'),
  analysis: z.string().describe(
    "In-depth technical analysis based on candlestick data, chart patterns (e.g., double bottom, head and shoulders), support/resistance zones, RSI, MACD, EMA crossovers, and volume dynamics."
  ),

  indicators: z.object({
    rsi: z.number().optional().describe("Relative Strength Index (0-100). Values >70 may indicate overbought, <30 oversold."),
    macd: z.string().optional().describe("MACD trend interpretation, e.g., 'MACD crossed above signal line - bullish momentum building'."),
    emaShort: z.number().optional().describe("Short-term EMA value."),
    emaLong: z.number().optional().describe("Long-term EMA value."),
    volumeTrend: z.string().optional().describe("Interpretation of recent volume trends, e.g., 'rising volume confirming breakout'.")
  }).optional(),

  marketSentiment: z.enum([
    "extremely bullish",
    "bullish",
    "neutral",
    "bearish",
    "extremely bearish"
  ]).describe("Aggregated sentiment from on-chain data, social media mentions, and market mood."),

  volatilityLevel: z.enum(["low", "moderate", "high", "extreme"])
    .describe("Estimated volatility level based on recent price fluctuations and Bollinger Band width."),

  riskLevel: z.enum(["low", "medium", "high"])
    .describe("Risk assessment based on volatility, liquidity, and trend strength."),

  pricePrediction: z.string().describe(
    "Short-term price projection, including possible range and key levels, e.g., 'Price may test $48,500 support before targeting $51,000'."
  ),

  aiRecommendation: z.enum([
    "strong buy",
    "buy",
    "hold",
    "sell",
    "strong sell"
  ]).describe("AI-generated recommendation based on combined signals, technicals, and market conditions."),

  reasoningSummary: z.string().describe(
    "A concise summary explaining how the model arrived at its recommendation (indicator alignment, trend confluence, sentiment support, etc.)."
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
  prompt: `You are an expert technical analyst for cryptocurrency markets. Your task is to analyze the provided candlestick data for {{cryptoSymbol}} on the {{timeframe}} timeframe.

The data is in the format [time, open, high, low, close, volume].

Your analysis must be comprehensive and cover these key areas:
1.  **Trend Identification**: Classify the current trend as 'strong bullish', 'bullish', 'neutral', 'bearish', or 'strong bearish'.
2.  **Chart Patterns**: Identify significant chart patterns (e.g., head and shoulders, double top/bottom, triangles, flags).
3.  **Support and Resistance**: Pinpoint key support and resistance levels.
4.  **Volume Analysis**: Analyze trading volume and its implications for the trend.
5.  **Indicator Analysis**: Interpret signals from RSI, MACD, and EMA crossovers if possible from the data.
6.  **Market Sentiment**: Infer the market sentiment.
7.  **Volatility and Risk**: Assess the current volatility and risk level.
8.  **Price Prediction**: Provide a concise, short-term price prediction with key levels.
9.  **AI Recommendation**: Give a clear 'strong buy', 'buy', 'hold', 'sell', or 'strong sell' recommendation.
10. **Reasoning Summary**: Provide a brief, clear summary of why you made that recommendation.

Candlestick Data for {{cryptoSymbol}} ({{timeframe}}):
{{candlestickData}}

Fill out all fields in the output schema with your detailed analysis. The 'analysis' field should contain the full technical breakdown, and the 'reasoningSummary' should be a concise conclusion.
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
    return output!;
  }
);
