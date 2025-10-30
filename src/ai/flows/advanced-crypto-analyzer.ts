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
  prompt: `You are an expert technical analyst for cryptocurrency markets.

Analyze the provided candlestick data for {{cryptoSymbol}} over the {{timeframe}} timeframe. The data is in the format [time, open, high, low, close, volume].

Your analysis should include:
1.  **Trend Identification**: Classify the current trend as 'strong bullish', 'bullish', 'neutral', 'bearish', or 'strong bearish'.
2.  **Pattern Recognition**: Identify any significant chart patterns (e.g., head and shoulders, double top/bottom, triangles, flags).
3.  **Support and Resistance**: Identify key support and resistance levels.
4.  **Volume Analysis**: Comment on the trading volume and how it supports the trend or indicates potential reversals.
5.  **Price Prediction**: Provide a brief, short-term price prediction.
6.  **Confidence Score**: Provide a confidence score from 0 to 1 for your overall analysis.
ANALYSIS FRAMEWORK:
1. TECHNICAL ANALYSIS: Analyze price action, volume, key technical indicators
2. SENTIMENT ANALYSIS: Evaluate market sentiment from news, social media, fear/greed
3. MARKET CONTEXT: Consider broader market conditions and sector performance
4. RISK ASSESSMENT: Identify potential risks and volatility levels
5. PREDICTIVE INSIGHTS: Provide short-term and medium-term outlook
Candlestick Data:
{{candlestickData}}

Provide a detailed analysis in the 'analysis' field and a concise prediction in the 'pricePrediction' field.
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
