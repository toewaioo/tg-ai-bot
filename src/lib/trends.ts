// IMPORTANT: This is a mock in-memory implementation.
// For a production application, you should use a persistent database or cache like Vercel KV, Redis, etc.

type Trend = 'bullish' | 'bearish' | 'neutral';
type TrendCache = Record<string, Trend>; // Coin symbol -> trend

const trendCache: TrendCache = {};

export const getLastTrend = (coin: string): Trend | undefined => {
  return trendCache[coin.toUpperCase()];
};

export const setLastTrend = (coin: string, trend: Trend): void => {
  trendCache[coin.toUpperCase()] = trend;
};
