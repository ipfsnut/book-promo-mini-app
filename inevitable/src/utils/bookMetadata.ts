// Alexandria NFT Book contract address
const BOOK_CONTRACT_ADDRESS = '0x64E2C384738b9Ca2C1820a00B3C2067B8213640e';
const CHAIN = 'base';
const ASSET_TYPE = 'alexandria_book';

// Types
export interface BookMetadata {
  title: string;
  description: string;
  author: string;
  imageURI: string;
  contentURI: string;
  additionalData?: {
    publishedDate?: string;
    format?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface CollectionInfo {
  name: string;
  description: string;
  creator: string;
  image: string;
  contractAddress: string;
  chain: string;
  [key: string]: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Cache mechanism for book metadata
let metadataCache: BookMetadata | null = null;
let cacheExpiration = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Fetch book metadata from PageDAO API
 * @param {string} tokenId - Token ID to fetch (default: '1')
 * @returns {Promise<BookMetadata>} Book metadata
 */
export async function fetchBookMetadata(tokenId = '1'): Promise<BookMetadata> {
  // Check if we have valid cached data
  const now = Date.now();
  if (metadataCache && now < cacheExpiration) {
    console.log('Using cached book metadata');
    return metadataCache;
  }
  
  try {
    console.log(`Fetching book metadata for token ID ${tokenId}...`);
    
    // Use the blockchain endpoint from PageDAO API
    const url = `https://pagedao-hub-serverless-api.netlify.app/.netlify/functions/blockchain/${CHAIN}/${BOOK_CONTRACT_ADDRESS}/metadata/${tokenId}?type=${ASSET_TYPE}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch book metadata');
    }
    
    const result = await response.json() as ApiResponse<BookMetadata>;
    
    if (!result || !result.success) {
      throw new Error('Failed to fetch book metadata');
    }
    
    const metadata = result.data;
    
    // Cache the data
    metadataCache = metadata;
    cacheExpiration = now + CACHE_DURATION;
    
    return metadata;
  } catch (error) {
    console.error('Error fetching book metadata:', error);
    
    // If the API fails, provide fallback metadata
    return getFallbackMetadata();
  }
}

/**
 * Get book collection info
 * @returns {Promise<CollectionInfo>} Collection metadata
 */
export async function getBookCollectionInfo(): Promise<CollectionInfo> {
  try {
    console.log('Fetching book collection info...');
    
    // Use the blockchain endpoint from PageDAO API
    const url = `https://pagedao-hub-serverless-api.netlify.app/.netlify/functions/blockchain/${CHAIN}/${BOOK_CONTRACT_ADDRESS}/info?type=${ASSET_TYPE}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch collection info');
    }
    
    const result = await response.json() as ApiResponse<CollectionInfo>;
    
    if (!result || !result.success) {
      throw new Error('Failed to fetch collection info');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching collection info:', error);
    
    // If the API fails, provide fallback collection info
    return getFallbackCollectionInfo();
  }
}

/**
 * Fallback book metadata in case API fails
 * @returns {BookMetadata} Fallback metadata
 */
function getFallbackMetadata(): BookMetadata {
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
 * @returns {CollectionInfo} Fallback collection info
 */
function getFallbackCollectionInfo(): CollectionInfo {
  return {
    name: 'INEVITABLE: Distributed Cognition & Network Superintelligence',
    description: 'An exploration of distributed cognition and the future of network superintelligence.',
    creator: 'EpicDylan',
    image: 'https://epicdylan.com/inevitable-cover.jpg',
    contractAddress: BOOK_CONTRACT_ADDRESS,
    chain: CHAIN
  };
}