import { bookConfig } from "../config";

export interface BookAsset {
  id: string;
  title: string;
  url: string;
  type: 'image' | 'text' | 'other';
}

export interface BookStats {
  readers: number;
  tokenHolders: number;
  totalSupply: number;
}

export const fetchBookAssets = async (): Promise<BookAsset[]> => {
  try {
    const response = await fetch(`${bookConfig.links.api}/assets`);
    if (!response.ok) {
      throw new Error('Failed to fetch book assets');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching book assets:', error);
    return [];
  }
};

export const fetchBookStats = async (): Promise<BookStats> => {
  try {
    // This would be replaced with actual API calls
    // For now returning mock data
    return {
      readers: 128,
      tokenHolders: 75,
      totalSupply: 1000
    };
  } catch (error) {
    console.error('Error fetching book stats:', error);
    return {
      readers: 0,
      tokenHolders: 0,
      totalSupply: 0
    };
  }
};
