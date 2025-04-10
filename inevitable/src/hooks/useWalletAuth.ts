import { useAccount, useReadContract, useSignMessage } from 'wagmi'
import { useState, useEffect } from 'react'
import { bookConfig } from '../config'
import { authService } from '../services/authService'
import { createAuthenticatedClient } from '../lib/supabase'

// ERC721 interface for checking NFT ownership
const erc721ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// ERC20 interface for checking token balance
const erc20ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export function useWalletAuth() {
  const { address, isConnected } = useAccount()
  const [userRole, setUserRole] = useState('member')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const { signMessageAsync } = useSignMessage()
  
  // Check NFT ownership
  const { data: nftBalance } = useReadContract({
    address: bookConfig.nftInfo?.contractAddress as `0x${string}`,
    abi: erc721ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Check token balance
  const { data: tokenBalance } = useReadContract({
    address: bookConfig.tokenInfo?.contractAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Determine if user has access based on NFT or token ownership
  const hasAccess = (nftBalance && Number(nftBalance) > 0) || 
                    (tokenBalance && Number(tokenBalance) >= bookConfig.tokenInfo.minBalance)

  // Update localStorage when NFT or token balances change
  useEffect(() => {
    const updateAccessStatus = async () => {
      if (isConnected && address) {
        // Make sure we're only using defined values and proper conversion
        const hasNFTAccess = nftBalance ? Number(nftBalance) > 0 : false;
        const hasTokenAccess = tokenBalance ? Number(tokenBalance) >= bookConfig.tokenInfo.minBalance : false;
        
        // Store the access status in localStorage
        localStorage.setItem('hasNFTAccess', hasNFTAccess ? 'true' : 'false');
        localStorage.setItem('hasTokenAccess', hasTokenAccess ? 'true' : 'false');
        
        // Only update in the database if the user is authenticated
        if (isAuthenticated) {
          try {
            await authService.updateAssetAccessStatus(address, hasNFTAccess, hasTokenAccess);
          } catch (error) {
            console.error('Error updating asset access status:', error);
          }
        }
      }
    };
    
    updateAccessStatus();
  }, [nftBalance, tokenBalance, isConnected, address, isAuthenticated]);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (isConnected && address) {
        try {
          const user = await authService.getCurrentUser()
          setIsAuthenticated(!!user)
          
          // If user exists, get their role
          if (user) {
            try {
              const supabase = createAuthenticatedClient();
              const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single()
              
              if (roleData) {
                setUserRole(roleData.role)
              }
            } catch (error) {
              console.error('Error fetching user role:', error)
              // Default to member role if there's an error
              setUserRole('member')
            }
          }
        } catch (error) {
          console.error('Error checking authentication:', error)
          setIsAuthenticated(false)
        }
      } else {
        setIsAuthenticated(false)
      }
    }
    
    checkAuth()
  }, [isConnected, address])

  // Sign in function - authenticate with the backend
  const signInWithWallet = async () => {
    if (!address || isAuthenticating) return false
    
    setIsAuthenticating(true)
    console.log("Starting explicit sign-in with wallet:", address)
    
    try {
      // Generate message to sign
      const message = authService.generateSignMessage(address)
      console.log("Generated message to sign:", message)
      
      // Request signature from wallet
      const signature = await signMessageAsync({ message })
      console.log("Received signature from wallet")
      
      // Generate verification token
      const verificationToken = authService.generateVerificationToken(signature)
      console.log("Generated verification token:", verificationToken.substring(0, 10) + "...")
      
      // Store in localStorage
      localStorage.setItem('walletAddress', address)
      localStorage.setItem('verificationToken', verificationToken)
      
      // Also store asset ownership status - FIX HERE
      const hasNFTAccess = nftBalance ? Number(nftBalance) > 0 : false;
      const hasTokenAccess = tokenBalance ? Number(tokenBalance) >= bookConfig.tokenInfo.minBalance : false;
      localStorage.setItem('hasNFTAccess', hasNFTAccess ? 'true' : 'false');
      localStorage.setItem('hasTokenAccess', hasTokenAccess ? 'true' : 'false');
      
      console.log("Stored credentials in localStorage")
      
      // Store in database
      console.log("Storing verification token in database...")
      try {
        const supabase = createAuthenticatedClient();
        const { error } = await supabase
          .from('verification_tokens')
          .upsert([
            {
              wallet_address: address,
              token: verificationToken,
              created_at: new Date().toISOString()
            }
          ])
        
        if (error) {
          console.error("Error storing verification token:", error)
          return false
        }
        
        console.log("Verification token stored successfully")
        
        // Now authenticate the user
        const user = await authService.authenticateWithWallet(address)
        setIsAuthenticated(!!user)
        
        // Update asset access status in the database
        await authService.updateAssetAccessStatus(
          address, 
          hasNFTAccess, 
          hasTokenAccess
        );
        
        return !!user
      } catch (error) {
        console.error("Error in token storage:", error)
        return false
      }
    } catch (error) {
      console.error('Authentication error:', error)
      return false
    } finally {
      setIsAuthenticating(false)
    }
  }

  const signIn = signInWithWallet

  return {
    isAuthenticated,
    hasAccess,
    userRole,
    signIn,
    isAuthenticating
  }
}