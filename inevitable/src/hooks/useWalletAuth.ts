import { useAccount, useReadContract, useSignMessage } from 'wagmi'
import { useState, useEffect } from 'react'
import { bookConfig } from '../config'
import { authService } from '../services/authService'

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
  const userRole = 'member'
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

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (isConnected && address) {
        console.log('Wallet connected, checking authentication for:', address)
        
        try {
          // First check if user exists
          const user = await authService.getCurrentUser()
          
          if (!user) {
            console.log('No user found for this wallet, creating new user...')
            try {
              // This will create a new user if one doesn't exist
              const newUser = await authService.authenticateWithWallet(address)
              console.log('New user authenticated:', newUser)
              setIsAuthenticated(!!newUser)
            } catch (error) {
              console.error('Error creating new user:', error)
              setIsAuthenticated(false)
            }
          } else {
            console.log('User found:', user)
            setIsAuthenticated(true)
          }
        } catch (error) {
          console.error('Error in authentication check:', error)
          setIsAuthenticated(false)
        }
      } else {
        setIsAuthenticated(false)
      }
    }
    
    checkAuth()
  }, [isConnected, address])

  // Sign in function - authenticate with the backend
  const signIn = async () => {
    if (!address || isAuthenticating) return false
    
    setIsAuthenticating(true)
    
    try {
      // Generate message to sign
      const message = authService.generateSignMessage(address)
      
      // Request signature from wallet
      const signature = await signMessageAsync({ message })
      
      // Authenticate with the wallet address, signature, and message
      const user = await authService.authenticateWithWallet(address, signature, message)
      setIsAuthenticated(!!user)
      return !!user
    } catch (error) {
      console.error('Authentication error:', error)
      return false
    } finally {
      setIsAuthenticating(false)
    }
  }

  return {
    isAuthenticated,
    hasAccess,
    userRole,
    signIn,
    isAuthenticating
  }
}