import { supabase } from '../lib/supabase';
import { ethers } from 'ethers'; // You'll need to install ethers package

export const authService = {
  // Get the current authenticated user
  async getCurrentUser() {
    try {
      // For wallet-based auth, we need to check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      ``
      if (!session) {
        // No session, check if we have a user in localStorage
        const walletAddress = localStorage.getItem('walletAddress');
        if (!walletAddress) return null;
        
        // Get user by wallet address
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', walletAddress);
        
        if (error) {
          console.error('Error fetching user:', error);
          return null;
        }
        
        // Return the first user if found
        return data && data.length > 0 ? data[0] : null;
      }
      
      // We have a session, get the user
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', session.user.id);
      
      if (error) {
        console.error('Error fetching user from session:', error);
        return null;
      }
      
      // Return the first user if found
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  // Generate a message for the user to sign
  generateSignMessage(address: string) {
    const timestamp = new Date().getTime();
    return `Sign this message to authenticate with INEVITABLE: ${address} at ${timestamp}`;
  },
  
  // Authenticate with wallet
  async authenticateWithWallet(address: string, signature?: string, message?: string) {
    try {
      console.log('Authenticating wallet:', address);
      
      // Store wallet address in localStorage for reference
      localStorage.setItem('walletAddress', address);
      
      // Verify signature if provided
      if (signature && message) {
        // Recover the address from the signature
        const recoveredAddress = ethers.verifyMessage(message, signature);
        
        // Check if the recovered address matches the provided address
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
          console.error('Signature verification failed');
          throw new Error('Signature verification failed');
        }
        
        console.log('Signature verified successfully');
      }
      
      // Check if user exists
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address);
      
      if (error) {
        console.error('Error checking user:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        // User exists, update last login
        console.log('User exists, updating last login for wallet:', address);
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('wallet_address', address)
          .select()
          .single();
        
        if (updateError) {
          console.error('Error updating user last login:', updateError);
          throw updateError;
        }
        
        return updatedUser;
      } else {
        // For new user creation, we should require a signature
        if (!signature && !message) {
          console.error('Signature required for new user creation');
          throw new Error('Signature required for new user creation');
        }
        
        // Create new user
        console.log('Creating new user for wallet:', address);
        
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([
            { 
              wallet_address: address,
              username: null,
              avatar_url: null
            }
          ])
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating user:', createError);
          
          // If it's a duplicate key error, the user might have been created in another request
          // Let's try to fetch the user again
          if (createError.code === '23505') {
            console.log('User already exists (created in another request), fetching...');
            const { data: existingUser, error: fetchError } = await supabase
              .from('users')
              .select('*')
              .eq('wallet_address', address);
              
            if (fetchError) {
              console.error('Error fetching existing user:', fetchError);
              throw fetchError;
            }
            
            return existingUser[0];
          }
          
          throw createError;
        }
        
        if (!newUser) {
          console.error('User creation returned null data');
          throw new Error('User creation failed');
        }
        
        console.log('New user created:', newUser);
        
        // Also add default role
        try {
          await supabase
            .from('user_roles')
            .insert([
              {
                user_id: newUser.id,
                role: 'member'
              }
            ]);
        } catch (roleError) {
          console.error('Error creating user role:', roleError);
          // Continue even if role creation fails
        }
        
        return newUser;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  },
  
  // Sign out
  async signOut() {
    try {
      localStorage.removeItem('walletAddress');
      await supabase.auth.signOut();
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  }
};
