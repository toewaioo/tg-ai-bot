export interface Ticker {
  symbol: string;
  open: string;
  high: string;
  low: string;
  close: string;
  changes: string[];
  bid: string;
  ask: string;
}

// Data format: [time, open, high, low, close, volume]
export type CandlestickData = [number, number, number, number, number, number][];

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const tickerCache = new Map<string, CacheEntry<Ticker>>();
const candleCache = new Map<string, CacheEntry<CandlestickData>>();

const TICKER_CACHE_TTL_MS = 60 * 1000; // 60 seconds
const CANDLE_CACHE_TTL_MS = 30 * 1000; // 30 seconds

export const getCryptoData = async (
  symbol: string
): Promise<Ticker | null> => {
  const formattedSymbol = `${symbol.toLowerCase()}usd`;
  const cached = tickerCache.get(formattedSymbol);

  if (cached && Date.now() - cached.timestamp < TICKER_CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    // Gemini uses symbols like 'btcusd', 'ethusd'
    const response = await fetch(
      `https://api.gemini.com/v2/ticker/${formattedSymbol}`
    );
    if (!response.ok) {
      console.error(
        `Failed to fetch data for ${symbol}: ${response.statusText}`
      );
      return null;
    }
    const data: Ticker = await response.json();
    tickerCache.set(formattedSymbol, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`Error fetching crypto data for ${symbol}:`, error);
    return null;
  }
};

export const getCandlestickData = async (
  symbol: string,
  timeframe: string
): Promise<CandlestickData | null> => {
  const formattedSymbol = `${symbol.toLowerCase()}usd`;
  const cacheKey = `${formattedSymbol}:${timeframe}`;
  const cached = candleCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CANDLE_CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `https://api.gemini.com/v2/candles/${formattedSymbol}/${timeframe}`
    );
    if (!response.ok) {
      console.error(
        `Failed to fetch candlestick data for ${symbol} with timeframe ${timeframe}: ${response.statusText}`
      );
      return null;
    }
    const data: CandlestickData = await response.json();
    // The API returns data in ascending order of time, so we reverse it to have the most recent data first
    const reversedData = data.reverse();
    candleCache.set(cacheKey, { data: reversedData, timestamp: Date.now() });
    return reversedData;
  } catch (error) {
    console.error(
      `Error fetching candlestick data for ${symbol} with timeframe ${timeframe}:`,
      error
    );
    return null;
  }
};
