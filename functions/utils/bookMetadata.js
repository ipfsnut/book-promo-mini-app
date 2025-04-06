const axios = require('axios');
const NodeCache = require('node-cache');

// Cache book metadata for 1 hour
const metadataCache = new NodeCache({ stdTTL: 3600 });

// Alexandria NFT Book contract address
const BOOK_CONTRACT_ADDRESS = '0x64E2C384738b9Ca2C1820a00B3C2067B8213640e';
const CHAIN = 'base';
const ASSET_TYPE = 'alexandria_book'; // Assuming this is the correct asset type

// PageDAO API URL
const API_BASE_URL = 'https://pagedao-hub-serverless-api.netlify.app/.netlify/functions';

/**
 * Fetch book metadata from PageDAO API
 * @param {string} tokenId - Token ID to fetch (default: '1')
 * @returns {Promise<Object>} Book metadata
 */
async function fetchBookMetadata(tokenId = '1') {
  const cacheKey = `book-${BOOK_CONTRACT_ADDRESS}-${tokenId}`;
  
  // Check if we have cached data
  const cachedData = metadataCache.get(cacheKey);
  if (cachedData) {
    console.log('Using cached book metadata');
    return cachedData;
  }
  
  try {
    console.log(`Fetching book metadata for token ID ${tokenId}...`);
    
    // Use the blockchain endpoint from PageDAO API
    const url = `${API_BASE_URL}/blockchain/${CHAIN}/${BOOK_CONTRACT_ADDRESS}/metadata/${tokenId}?type=${ASSET_TYPE}`;
    const response = await axios.get(url);
    
    if (!response.data || !response.data.success) {
      throw new Error('Failed to fetch book metadata');
    }
    
    const metadata = response.data.data;
    
    // Cache the data
    metadataCache.set(cacheKey, metadata);
    
    return metadata;
  } catch (error) {
    console.error('Error fetching book metadata:', error.message);
    
    // If the API fails, provide fallback metadata
    return getFallbackMetadata();
  }
}

/**
 * Get book collection info
 * @returns {Promise<Object>} Collection metadata
 */
async function getBookCollectionInfo() {
  const cacheKey = `collection-${BOOK_CONTRACT_ADDRESS}`;
  
  // Check if we have cached data
  const cachedData = metadataCache.get(cacheKey);
  if (cachedData) {
    console.log('Using cached collection metadata');
    return cachedData;
  }
  
  try {
    console.log('Fetching book collection info...');
    
    // Use the blockchain endpoint from PageDAO API
    const url = `${API_BASE_URL}/blockchain/${CHAIN}/${BOOK_CONTRACT_ADDRESS}/info?type=${ASSET_TYPE}`;
    const response = await axios.get(url);
    
    if (!response.data || !response.data.success) {
      throw new Error('Failed to fetch collection info');
    }
    
    const collectionInfo = response.data.data;
    
    // Cache the data
    metadataCache.set(cacheKey, collectionInfo);
    
    return collectionInfo;
  } catch (error) {
    console.error('Error fetching collection info:', error.message);
    
    // If the API fails, provide fallback collection info
    return getFallbackCollectionInfo();
  }
}

/**
 * Fallback book metadata in case API fails
 * @returns {Object} Fallback metadata
 */
function getFallbackMetadata() {
  return {
    title: 'INEVITABLE: Distributed Cognition & Network Superintelligence',
    description: 'An exploration of distributed cognition and the future of network superintelligence.',
    author: 'EpicDylan',
    imageURI: 'https://epicdylan.com/inevitable-cover.jpg',
    contentURI: 'https://www.alexandriabooks.com/collection/inevitable',
    additionalData: {
      publishedDate: '2023',
      format: 'Digital Book'
    }
  };
}

/**
 * Fallback collection info in case API fails
 * @returns {Object} Fallback collection info
 */
function getFallbackCollectionInfo() {
  return {
    name: 'INEVITABLE: Distributed Cognition & Network Superintelligence',
    description: 'An exploration of distributed cognition and the future of network superintelligence.',
    creator: 'EpicDylan',
    image: 'https://epicdylan.com/inevitable-cover.jpg',
    contractAddress: BOOK_CONTRACT_ADDRESS,
    chain: CHAIN
  };
}

module.exports = {
  fetchBookMetadata,
  getBookCollectionInfo,
  BOOK_CONTRACT_ADDRESS,
  CHAIN
};