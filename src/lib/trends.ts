// IMPORTANT: This is a mock in-memory implementation.
// For a production application, you should use a persistent database or cache like Vercel KV, Redis, etc.

type Signal = 'strong buy' | 'buy' | 'hold' | 'sell' | 'strong sell' | 'bullish' | 'bearish' | 'neutral';
type TrendCache = Record<string, Signal>; // Coin symbol -> signal/trend

const trendCache: TrendCache = {};

export const getLastTrend = (coin: string): Signal | undefined => {
  return trendCache[coin.toUpperCase()];
};

export const setLastTrend = (coin: string, trend: Signal): void => {
  trendCache[coin.toUpperCase()] = trend;
};
