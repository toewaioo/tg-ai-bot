'use server';

/**
 * @fileOverview Analyzes crypto market trends using the Gemini API and classifies them as bullish or bearish.
 *
 * - analyzeCryptoTrend - A function that analyzes the crypto trend.
 * - AnalyzeCryptoTrendInput - The input type for the analyzeCryptoTrend function.
 * - AnalyzeCryptoTrendOutput - The return type for the analyzeCryptoTrend function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCryptoTrendInputSchema = z.object({
  cryptoSymbol: z.string().describe('The symbol of the cryptocurrency to analyze (e.g., BTC).'),
  marketData: z.string().describe('The recent market data for the cryptocurrency, including price and volume.'),
});
export type AnalyzeCryptoTrendInput = z.infer<typeof AnalyzeCryptoTrendInputSchema>;

const AnalyzeCryptoTrendOutputSchema = z.object({
  trend: z.enum(['bullish', 'bearish', 'neutral']).describe('The classified trend of the cryptocurrency.'),
  confidence: z.number().describe('The confidence level (0-1) of the trend classification.'),
  reason: z.string().describe('The reason for the trend classification.'),
});
export type AnalyzeCryptoTrendOutput = z.infer<typeof AnalyzeCryptoTrendOutputSchema>;

export async function analyzeCryptoTrend(input: AnalyzeCryptoTrendInput): Promise<AnalyzeCryptoTrendOutput> {
  return analyzeCryptoTrendFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCryptoTrendPrompt',
  input: {schema: AnalyzeCryptoTrendInputSchema},
  output: {schema: AnalyzeCryptoTrendOutputSchema},
  prompt: `You are a crypto market analyst. Analyze the market data for {{cryptoSymbol}} and classify the trend as bullish, bearish, or neutral.\n\nMarket Data:\n{{marketData}}\n\nProvide a confidence level (0-1) for your classification and a brief reason for your analysis. Output the result in JSON format. Ensure the JSON is parseable.\n`,
});

const analyzeCryptoTrendFlow = ai.defineFlow(
  {
    name: 'analyzeCryptoTrendFlow',
    inputSchema: AnalyzeCryptoTrendInputSchema,
    outputSchema: AnalyzeCryptoTrendOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

