import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define Supabase URL and key at the top
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a singleton client
let supabaseClient: SupabaseClient | null = null;

// Get or create the authenticated client
const getAuthenticatedClient = () => {
  if (!supabaseClient) {
    const walletAddress = localStorage.getItem('walletAddress');
    const verificationToken = localStorage.getItem('verificationToken');
    const hasNFTAccess = localStorage.getItem('hasNFTAccess');
    const hasTokenAccess = localStorage.getItem('hasTokenAccess');
    
    const headers: Record<string, string> = {};
    if (walletAddress) headers['x-wallet-address'] = walletAddress;
    if (verificationToken) headers['x-wallet-verification'] = verificationToken;
    if (hasNFTAccess) headers['x-has-nft-access'] = hasNFTAccess;
    if (hasTokenAccess) headers['x-has-token-access'] = hasTokenAccess;
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers
      }
    });
  }
  
  return supabaseClient;
};

// Update the client headers when authentication changes
const updateClientHeaders = () => {
  const walletAddress = localStorage.getItem('walletAddress');
  const verificationToken = localStorage.getItem('verificationToken');
  const hasNFTAccess = localStorage.getItem('hasNFTAccess');
  const hasTokenAccess = localStorage.getItem('hasTokenAccess');
  
  if (!supabaseClient) {
    getAuthenticatedClient();
    return;
  }
  
  // Instead of directly accessing the rest property, create a new client
  // with the updated headers
  const headers: Record<string, string> = {};
  if (walletAddress) headers['x-wallet-address'] = walletAddress;
  if (verificationToken) headers['x-wallet-verification'] = verificationToken;
  if (hasNFTAccess) headers['x-has-nft-access'] = hasNFTAccess;
  if (hasTokenAccess) headers['x-has-token-access'] = hasTokenAccess;
  
  // Create a new client with the updated headers
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers
    }
  });
};

interface User {
  id: string;
  wallet_address: string;
  username: string | null;
  avatar_url: string | null;
  last_login?: string;
  [key: string]: any;
}

// Add this interface to fix window.ethereum type error
interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
  selectedAddress?: string;
  isMetaMask?: boolean;
  isConnected?: () => boolean;
}

// Extend the Window interface
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export const authService = {
  // Expose the client getter for other services
  getClient: getAuthenticatedClient,
  
  // Update client headers
  updateHeaders: updateClientHeaders,
  
  // Get the current authenticated user
  async getCurrentUser(): Promise<User | null> {
    try {
      // Check if we have a wallet address and verification token in localStorage
      const walletAddress = localStorage.getItem('walletAddress');
      const verificationToken = localStorage.getItem('verificationToken');
      
      console.log("Auth check - localStorage values:", { 
        walletAddress, 
        verificationToken: verificationToken ? `${verificationToken.substring(0, 10)}...` : null 
      });
      
      if (!walletAddress || !verificationToken) {
        console.log("Auth check - missing credentials in localStorage");
        return null;
      }
      
      // Get the client with current headers
      const supabase = getAuthenticatedClient();
      
      // Get user by wallet address
      console.log("Auth check - fetching user with wallet address:", walletAddress);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();
      
      if (error) {
        console.log("Auth check - error fetching user:", error);
        return null;
      }
      
      console.log("Auth check - found user:", data);
      return data as User;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  // Generate a message for the user to sign
  generateSignMessage(address: string): string {
    const timestamp = new Date().getTime();
    return `Sign this message to authenticate with INEVITABLE: ${address} at ${timestamp}`;
  },
  
  // Refresh authentication status
  async refreshAuthenticationStatus(): Promise<boolean> {
    try {
      const walletAddress = localStorage.getItem('walletAddress');
      const verificationToken = localStorage.getItem('verificationToken');
      
      if (!walletAddress || !verificationToken) {
        console.log("No wallet address or verification token found");
        return false;
      }
      
      // Get the client with current headers
      const supabase = getAuthenticatedClient();
      
      // Check if token exists and is valid
      try {
        const { data, error } = await supabase
          .from('verification_tokens')
          .select('*')
          .eq('wallet_address', walletAddress)
          .maybeSingle();
          
        if (error) {
          console.error('Error checking verification token:', error);
          return false;
        }
        
        if (!data || data.token !== verificationToken) {
          console.error('Invalid or expired verification token');
          return false;
        }
        
        // Token is valid, refresh the user's last login
        const updateResult = await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('wallet_address', walletAddress);
          
        if (updateResult.error) {
          console.error('Error updating last login:', updateResult.error);
        }
        
        // Update client headers to ensure they're current
        updateClientHeaders();
        
        return true;
      } catch (error) {
        console.error('Error in token verification:', error);
        return false;
      }
    } catch (error) {
      console.error('Error refreshing authentication status:', error);
      return false;
    }
  },
  
  // Authenticate with wallet and signature
  async authenticateWithWallet(address: string, signature?: string, message?: string): Promise<User | null> {
    try {
      console.log("Starting authentication for wallet:", address);
      console.log("Signature and message provided:", !!signature && !!message);
      
      // If signature and message are provided, verify them
      if (signature && message) {
        console.log("Verifying signature...");
        
        // Use Supabase RPC to verify the signature
        const supabase = getAuthenticatedClient();
        const { data: verificationData, error: verificationError } = await supabase.rpc('verify_wallet_signature', {
          p_wallet_address: address,
          p_signature: signature,
          p_message: message
        });
        
        if (verificationError) {
          console.error("Signature verification failed:", verificationError);
          throw new Error('Signature verification failed');
        }
        
        console.log("Verification result:", verificationData);
        
        if (!verificationData || !verificationData.is_valid) {
          console.error("Invalid signature");
          throw new Error('Invalid signature');
        }
        
        // Store the verification token from the RPC response
        const verificationToken = verificationData.token;
        console.log("Generated verification token:", verificationToken.substring(0, 10) + "...");
        
        // Store in localStorage
        localStorage.setItem('walletAddress', address);
        localStorage.setItem('verificationToken', verificationToken);
        console.log("Stored credentials in localStorage");
        
        // Update client headers
        updateClientHeaders();
      } else {
        console.log("No signature/message provided, skipping verification");
      }
      
      // Check if user exists in our custom users table
      console.log("Checking if user exists...");
      const supabase = getAuthenticatedClient();
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address);
      
      // Handle the case where the user doesn't exist yet
      if (fetchError) {
        console.error('Error checking user:', fetchError);
        throw fetchError;
      }
      
      console.log("User check result:", existingUser ? `Found ${existingUser.length} users` : "No users found");
      
      if (existingUser && existingUser.length > 0) {
        // User exists, update last login
        console.log("Updating last login for existing user");
        const { data, error } = await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('wallet_address', address)
          .select();
        
        if (error) {
          console.error("Error updating user:", error);
          throw error;
        }
        
        console.log("User updated successfully:", data?.[0]);
        return data?.[0] as User;
      } else {
        // Create new user
        console.log("Creating new user for wallet:", address);
        const { data, error } = await supabase
          .from('users')
          .insert([
            { 
              wallet_address: address,
              username: null,
              avatar_url: null
            }
          ])
          .select();
        
        if (error) {
          console.error("Error creating user:", error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.error("User creation returned no data");
          throw new Error('User creation failed');
        }
        
        console.log("New user created:", data[0]);
        
        // Also add default role
        try {
          console.log("Adding default role for new user");
          await supabase
            .from('user_roles')
            .insert([
              {
                user_id: data[0].id,
                role: 'member'
              }
            ]);
          console.log("Default role added successfully");
        } catch (roleError) {
          console.error('Error creating user role:', roleError);
          // Continue even if role creation fails
        }
        
        return data[0] as User;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  },
  
  // Sign out
  async signOut(): Promise<boolean> {
    try {
      // Remove verification token from database
      const walletAddress = localStorage.getItem('walletAddress');
      const verificationToken = localStorage.getItem('verificationToken');
      
      if (walletAddress && verificationToken) {
        try {
          const supabase = getAuthenticatedClient();
          await supabase
            .from('verification_tokens')
            .delete()
            .eq('wallet_address', walletAddress)
            .eq('token', verificationToken);
        } catch (error) {
          console.error('Error removing verification token:', error);
          // Continue with sign out even if token removal fails
        }
      }
      
      // Clear localStorage
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('verificationToken');
      localStorage.removeItem('hasNFTAccess');
      localStorage.removeItem('hasTokenAccess');
      
      // Reset the client
      supabaseClient = null;
      
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  },
  
  // Update user token and NFT access status in localStorage
  async updateAssetAccessStatus(address: string, hasNFTAccess: boolean, hasTokenAccess: boolean): Promise<void> {
    localStorage.setItem('hasNFTAccess', hasNFTAccess ? 'true' : 'false');
    localStorage.setItem('hasTokenAccess', hasTokenAccess ? 'true' : 'false');
    
    // Update client headers
    updateClientHeaders();
    
    // Also update this in the database for RLS policies
    try {
      const supabase = getAuthenticatedClient();
      
      // First check if the user exists in the database
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', address)
        .single();
        
      if (!user) {
        console.error('User not found for asset access update');
        return;
      }
      
      // Try to use the RPC function first
      try {
        const { error: rpcError } = await supabase.rpc('update_user_asset_access', {
          wallet_addr: address,
          has_nft: hasNFTAccess,
          has_token: hasTokenAccess
        });
        
        if (rpcError) {
          console.error('Error updating asset access with RPC:', rpcError);
          throw rpcError; // Fall back to direct table update
        }
      } catch (rpcError) {
        console.error('Failed to use RPC, trying direct table update:', rpcError);
        
        // Fall back to direct table manipulation if RPC fails
        const { data: existingStatus } = await supabase
          .from('user_asset_status')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (existingStatus) {
          // Update existing record
          await supabase
            .from('user_asset_status')
            .update({
              has_nft_access: hasNFTAccess,
              has_token_access: hasTokenAccess,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
        } else {
          // Insert new record
          await supabase
            .from('user_asset_status')
            .insert([{
              user_id: user.id,
              has_nft_access: hasNFTAccess,
              has_token_access: hasTokenAccess,
              updated_at: new Date().toISOString()
            }]);
        }
      }
    } catch (error) {
      console.error('Error updating asset access in database:', error);
    }
  },
  
  // Connect wallet using window.ethereum directly
  async connectWallet(): Promise<string> {
    try {
      if (!window.ethereum) {
        throw new Error('No Ethereum wallet found. Please install MetaMask or another wallet.');
      }
      
      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];
      
      // Create a message to sign
      const message = this.generateSignMessage(walletAddress);
      
            // Request signature
            const signature = await window.ethereum.request({
              method: 'personal_sign',
              params: [message, walletAddress]
            });
            
            // Authenticate with the wallet and signature
            const user = await this.authenticateWithWallet(walletAddress, signature, message);
            
            if (!user) {
              throw new Error('Authentication failed');
            }
            
            return walletAddress;
          } catch (error) {
            console.error('Error connecting wallet:', error);
            throw error;
          }
        },
        
        // Debug authentication
        async debugAuth() {
          try {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase.rpc('debug_auth');
            
            if (error) {
              console.error("Error debugging auth:", error);
              return null;
            }
            
            console.log("Authentication Debug:", data);
            return data;
          } catch (error) {
            console.error("Error debugging auth:", error);
            return null;
          }
        },
        // Add this method to the authService object
        generateVerificationToken(signature: string): string {
          // Create a simple hash of the signature to use as a verification token
          // This is a simplified version - in production, you might want a more secure approach
          let hash = 0;
          for (let i = 0; i < signature.length; i++) {
            const char = signature.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
          }
          // Convert to hex string and ensure it's positive
          return Math.abs(hash).toString(16).padStart(8, '0') + Date.now().toString(16);
        }
      };
      
