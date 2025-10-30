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


export const getCryptoData = async (
  symbol: string
): Promise<Ticker | null> => {
  try {
    // Gemini uses symbols like 'btcusd', 'ethusd'
    const formattedSymbol = `${symbol.toLowerCase()}usd`;
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
  try {
    const formattedSymbol = `${symbol.toLowerCase()}usd`;
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
    return data.reverse();
  } catch (error) {
    console.error(
      `Error fetching candlestick data for ${symbol} with timeframe ${timeframe}:`,
      error
    );
    return null;
  }
};
