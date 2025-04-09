import { supabase } from '../lib/supabase';
import { ethers } from 'ethers'; // You'll need to install this package

interface User {
  id: string;
  wallet_address: string;
  username: string | null;
  avatar_url: string | null;
  last_login?: string;
  [key: string]: any;
}

export const authService = {
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
  
  // Verify a signature
  verifySignature(address: string, signature: string, message: string): boolean {
    try {
      // Recover the address from the signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      // Check if the recovered address matches the provided address
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  },
  
  // Generate a verification token from a signature
  generateVerificationToken(signature: string): string {
    // Create a hash of the signature to use as a verification token
    return ethers.keccak256(ethers.toUtf8Bytes(signature)).substring(2);
  },
  
  // Authenticate with wallet and signature
  async authenticateWithWallet(address: string, signature?: string, message?: string): Promise<User | null> {
    try {
      console.log("Starting authentication for wallet:", address);
      console.log("Signature and message provided:", !!signature && !!message);
      
      // If signature and message are provided, verify them
      if (signature && message) {
        console.log("Verifying signature...");
        const isValid = this.verifySignature(address, signature, message);
        console.log("Signature verification result:", isValid);
        
        if (!isValid) {
          console.error("Invalid signature");
          throw new Error('Invalid signature');
        }
        
        // Generate a verification token from the signature
        const verificationToken = this.generateVerificationToken(signature);
        console.log("Generated verification token:", verificationToken.substring(0, 10) + "...");
        console.log("Full verification token:", verificationToken);
        
        // Store in localStorage
        localStorage.setItem('walletAddress', address);
        localStorage.setItem('verificationToken', verificationToken);
        console.log("Stored credentials in localStorage");
        
        // Store the verification token in the database
        console.log("Storing verification token in database...");
        
        // First delete any existing tokens for this wallet
        try {
          await supabase
            .from('verification_tokens')
            .delete()
            .eq('wallet_address', address);
          console.log("Deleted existing verification tokens");
        } catch (deleteError) {
          console.error("Error deleting existing tokens:", deleteError);
        }
        
        // Then insert the new token
        try {
          const { error: insertError } = await supabase
            .from('verification_tokens')
            .insert([
              {
                wallet_address: address,
                token: verificationToken,
                created_at: new Date().toISOString()
              }
            ]);
          
          if (insertError) {
            console.error("Error inserting verification token:", insertError);
          } else {
            console.log("Verification token inserted successfully");
            
            // Verify the token was stored
            const { data: checkData, error: checkError } = await supabase
              .from('verification_tokens')
              .select('*')
              .eq('wallet_address', address);
            
            if (checkError) {
              console.error("Error checking verification token:", checkError);
            } else {
              console.log("Verification token check:", checkData);
            }
          }
        } catch (insertError) {
          console.error("Error inserting verification token:", insertError);
        }
      } else {
        console.log("No signature/message provided, skipping verification");
      }
      
      // Check if user exists in our custom users table
      console.log("Checking if user exists...");
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
      
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  }
};
