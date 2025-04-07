import { bookConfig } from "../config";

// Types for our API responses
export interface BookStats {
  readers: number;
  tokenHolders: number;
  totalSupply: number;
  maxSupply: number;
}

export interface BookAsset {
  id: string;
  title: string;
  type: string;
  url: string;
}

export interface NFTMetadata {
  title: string;
  description: string;
  imageURI: string;
  creator: string;
  totalSupply: number;
  maxSupply: number;
  format: string;
  additionalData?: {
    symbol: string;
    [key: string]: any;
  };
  owner?: string;
  [key: string]: any;
}

const API_BASE_URL = bookConfig.links.api;

/**
 * Fetch book collection information including total supply
 */
export async function fetchBookCollectionInfo(): Promise<NFTMetadata> {
  try {
    // The contract address for the book NFT
    const contractAddress = bookConfig.tokenInfo.contractAddress;
    const chain = "base"; // Assuming the book is on Base chain
    
    const response = await fetch(
      `${API_BASE_URL}nft/${contractAddress}/${chain}/collection-info`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching book collection info:", error);
    // Return default data if API fails
    return {
      title: bookConfig.title,
      description: "A groundbreaking exploration of technology and humanity's future.",
      imageURI: bookConfig.coverImage,
      creator: bookConfig.author,
      totalSupply: 0,
      maxSupply: 0,
      format: "nft"
    };
  }
}

/**
 * Check if an address owns the book NFT
 */
export async function checkBookOwnership(ownerAddress: string): Promise<boolean> {
  try {
    const contractAddress = bookConfig.tokenInfo.contractAddress;
    const chain = "base";
    
    // We'll check if the user owns any tokens from this collection
    const response = await fetch(
      `${API_BASE_URL}nft/${contractAddress}/${chain}/owner/${ownerAddress}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.tokens && data.tokens.length > 0;
  } catch (error) {
    console.error("Error checking book ownership:", error);
    return false;
  }
}

/**
 * Fetch book stats including readers and token holders
 */
export async function fetchBookStats(): Promise<BookStats> {
  try {
    // First get the collection info for supply data
    const collectionInfo = await fetchBookCollectionInfo();
    
    // For now, we'll estimate readers and token holders
    // In a real implementation, you might have a separate API endpoint for this
    const tokenHolders = Math.floor(collectionInfo.totalSupply * 0.8); // Estimate unique holders
    const readers = Math.floor(collectionInfo.totalSupply * 1.5); // Estimate readers (including non-token holders)
    
    return {
      readers,
      tokenHolders,
      totalSupply: collectionInfo.totalSupply,
      maxSupply: collectionInfo.maxSupply
    };
  } catch (error) {
    console.error("Error fetching book stats:", error);
    // Return default data if API fails
    return {
      readers: 1250,
      tokenHolders: 378,
      totalSupply: 1000,
      maxSupply: 10000
    };
  }
}

/**
 * Fetch book assets (could be chapter previews, supplementary materials, etc.)
 */
export async function fetchBookAssets(): Promise<BookAsset[]> {
  try {
    // In a real implementation, you would have an API endpoint for this
    // For now, we'll return some mock data
    return [
      {
        id: "1",
        title: "Chapter 1 Preview",
        type: "pdf",
        url: "https://example.com/chapter1.pdf"
      },
      {
        id: "2",
        title: "Author Interview",
        type: "video",
        url: "https://example.com/interview.mp4"
      }
    ];
  } catch (error) {
    console.error("Error fetching book assets:", error);
    return [];
  }
}
