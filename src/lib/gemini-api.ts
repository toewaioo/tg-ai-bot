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
