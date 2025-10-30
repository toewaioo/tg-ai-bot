'use server';

/**
 * @fileOverview Summarizes market sentiment for a given cryptocurrency using recent news and social media data.
 *
 * - summarizeMarketSentiment - A function that takes a cryptocurrency ticker symbol as input and returns a summary of the market sentiment.
 * - SummarizeMarketSentimentInput - The input type for the summarizeMarketSentiment function.
 * - SummarizeMarketSentimentOutput - The return type for the summarizeMarketSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMarketSentimentInputSchema = z.object({
  ticker: z.string().describe('The ticker symbol of the cryptocurrency to analyze (e.g., BTC, ETH).'),
});
export type SummarizeMarketSentimentInput = z.infer<typeof SummarizeMarketSentimentInputSchema>;

const SummarizeMarketSentimentOutputSchema = z.object({
  sentimentSummary: z.string().describe('A summary of the market sentiment for the given cryptocurrency, based on recent news and social media data.'),
});
export type SummarizeMarketSentimentOutput = z.infer<typeof SummarizeMarketSentimentOutputSchema>;

export async function summarizeMarketSentiment(input: SummarizeMarketSentimentInput): Promise<SummarizeMarketSentimentOutput> {
  return summarizeMarketSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMarketSentimentPrompt',
  input: {schema: SummarizeMarketSentimentInputSchema},
  output: {schema: SummarizeMarketSentimentOutputSchema},
  prompt: `You are an AI assistant that summarizes the market sentiment for cryptocurrencies.

  Given the ticker symbol for a cryptocurrency, analyze recent news articles and social media posts to determine the overall market sentiment.
  The summary should be concise and informative, highlighting the key factors driving the sentiment (e.g., positive news, negative events, social media trends).

  Ticker Symbol: {{{ticker}}}
  \n  Summarize the current market sentiment for {{ticker}}:
  `,
});

const summarizeMarketSentimentFlow = ai.defineFlow(
  {
    name: 'summarizeMarketSentimentFlow',
    inputSchema: SummarizeMarketSentimentInputSchema,
    outputSchema: SummarizeMarketSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
