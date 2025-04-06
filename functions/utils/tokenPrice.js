const axios = require('axios');
const NodeCache = require('node-cache');

// Cache token prices for 5 minutes
const priceCache = new NodeCache({ stdTTL: 300 });

// NSI Memecoin contract address
const NSI_CONTRACT_ADDRESS = '0x1696688A7828E227E64953C371aC0B57d5974B55';
const CHAIN = 'base';

/**
 * Fetch NSI token price and market data
 * @returns {Promise<Object>} Token price and market data
 */
async function fetchNSITokenData() {
  const cacheKey = `nsi-price`;
  
  // Check if we have cached data
  const cachedData = priceCache.get(cacheKey);
  if (cachedData) {
    console.log('Using cached token price data');
    return cachedData;
  }
  
  try {
    console.log('Fetching NSI token data...');
    
    // Try to fetch from DexScreener API
    const dexscreenerUrl = `https://api.dexscreener.com/latest/dex/tokens/${NSI_CONTRACT_ADDRESS}`;
    const response = await axios.get(dexscreenerUrl);
    
    // Process the response
    if (response.data && response.data.pairs && response.data.pairs.length > 0) {
      // Sort pairs by liquidity to get the main pair
      const pairs = response.data.pairs.sort((a, b) => 
        parseFloat(b.liquidity?.usd || 0) - parseFloat(a.liquidity?.usd || 0)
      );
      
      const mainPair = pairs[0];
      
      const tokenData = {
        symbol: mainPair.baseToken.symbol,
        name: 'Network Superintelligence',
        price: mainPair.priceUsd,
        priceChange24h: mainPair.priceChange.h24,
        liquidity: mainPair.liquidity?.usd || 0,
        volume24h: mainPair.volume?.h24 || 0,
        marketCap: mainPair.fdv || 0,
        pairAddress: mainPair.pairAddress,
        dexId: mainPair.dexId
      };
      
      // Cache the data
      priceCache.set(cacheKey, tokenData);
      
      return tokenData;
    }
    
    throw new Error('No valid pairs found for token');
  } catch (error) {
    console.error('Error fetching NSI token data:', error.message);
    
    // If API fails, return fallback data
    return getFallbackTokenData();
  }
}

/**
 * Fallback token data in case API fails
 * @returns {Object} Fallback token data
 */
function getFallbackTokenData() {
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

module.exports = {
  fetchNSITokenData,
  NSI_CONTRACT_ADDRESS,
  CHAIN
};