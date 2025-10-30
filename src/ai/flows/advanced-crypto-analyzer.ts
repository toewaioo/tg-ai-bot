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
  analysis: z.string().describe('A detailed analysis based on the candlestick data, including patterns, support/resistance levels, and volume analysis.'),
  pricePrediction: z.string().describe('A short-term price prediction (e.g., "Price may test the $50,000 resistance level.").'),
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
