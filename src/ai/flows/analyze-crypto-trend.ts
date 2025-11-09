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
  prompt: `You are an expert financial analyst and AI advisor for the cryptocurrency markets. Analyze the market data for {{cryptoSymbol}} and classify the trend as bullish, bearish, or neutral.\n\nMarket Data:\n{{marketData}}\n\nProvide a confidence level (0-1) for your classification and a brief reason for your analysis. Output the result in JSON format. Ensure the JSON is parseable.\n
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
`,
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

