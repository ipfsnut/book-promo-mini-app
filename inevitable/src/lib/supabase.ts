import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Store singleton instance
let supabaseInstance: SupabaseClient | null = null;

// Create a wrapper function that creates or retrieves a client with current headers
export const createAuthenticatedClient = () => {
  // Get auth data from localStorage
  const walletAddress = localStorage.getItem('walletAddress');
  const verificationToken = localStorage.getItem('verificationToken');
  const hasNFTAccess = localStorage.getItem('hasNFTAccess');
  const hasTokenAccess = localStorage.getItem('hasTokenAccess');
  
  // Build headers
  const headers: Record<string, string> = {};
  if (walletAddress) headers['x-wallet-address'] = walletAddress;
  if (verificationToken) headers['x-wallet-verification'] = verificationToken;
  if (hasNFTAccess) headers['x-has-nft-access'] = hasNFTAccess;
  if (hasTokenAccess) headers['x-has-token-access'] = hasTokenAccess;
  
  // Create a new client with current headers
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers
    }
  });
  
  return supabaseInstance;
};

// For backward compatibility, export a singleton instance
export const supabase = createAuthenticatedClient();

// Export a function to get a fresh client
export const getFreshClient = () => createAuthenticatedClient();