// NSI Memecoin contract address
const NSI_CONTRACT_ADDRESS = '0x1696688A7828E227E64953C371aC0B57d5974B55';
const CHAIN = 'base';

// Types
export interface TokenData {
  symbol: string;
  name: string;
  price: string;
  priceChange24h: string;
  liquidity: string | number;
  volume24h: string | number;
  marketCap?: string | number;
  pairAddress?: string;
  dexId?: string;
}

interface DexscreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: {
      buys: number;
      sells: number;
    };
    h1: {
      buys: number;
      sells: number;
    };
    h6: {
      buys: number;
      sells: number;
    };
    h24: {
      buys: number;
      sells: number;
    };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
}

interface DexscreenerResponse {
  schemaVersion: string;
  pairs: DexscreenerPair[];
}

// Cache mechanism for token prices
let priceCache: TokenData | null = null;
let cacheExpiration = 0;
const CACHE_DURATION = 300000; // 5 minutes in milliseconds

/**
 * Fetch NSI token price and market data
 * @returns {Promise<TokenData>} Token price and market data
 */
export async function fetchNSITokenData(): Promise<TokenData> {
  // Check if we have valid cached data
  const now = Date.now();
  if (priceCache && now < cacheExpiration) {
    console.log('Using cached token price data');
    return priceCache;
  }
  
  try {
    console.log('Fetching NSI token data...');
    
    // Try to fetch from DexScreener API
    const dexscreenerUrl = `https://api.dexscreener.com/latest/dex/tokens/${NSI_CONTRACT_ADDRESS}`;
    const response = await fetch(dexscreenerUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch token data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as DexscreenerResponse;
    
    // Process the response
    if (data && data.pairs && data.pairs.length > 0) {
      // Sort pairs by liquidity to get the main pair
      const pairs = data.pairs.sort((a, b) => 
        (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
      );
      
      const mainPair = pairs[0];
      
      const tokenData: TokenData = {
        symbol: mainPair.baseToken.symbol,
        name: 'Network Superintelligence',
        price: mainPair.priceUsd,
        priceChange24h: mainPair.priceChange.h24.toString(),
        liquidity: mainPair.liquidity?.usd || 0,
        volume24h: mainPair.volume?.h24 || 0,
        marketCap: mainPair.fdv || 0,
        pairAddress: mainPair.pairAddress,
        dexId: mainPair.dexId
      };
      
      // Cache the data
      priceCache = tokenData;
      cacheExpiration = now + CACHE_DURATION;
      
      return tokenData;
    }
    
    throw new Error('No valid pairs found for token');
  } catch (error) {
    console.error('Error fetching NSI token data:', error);
    
    // If API fails, return fallback data
    return getFallbackTokenData();
  }
}

/**
 * Fallback token data in case API fails
 * @returns {TokenData} Fallback token data
 */
function getFallbackTokenData(): TokenData {
  return {
    symbol: 'NSI',
    name: 'Network Superintelligence',
    price: '0.00000123',
    priceChange24h: '5.2',
    liquidity: '25000',
    volume24h: '3500',
    marketCap: '123000',
    pairAddress: NSI_CONTRACT_ADDRESS,
    dexId: 'baseswap'
  };
}