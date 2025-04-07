import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { bookConfig } from "../config";

// ERC721 standard ABI for NFT ownership check
const erc721Abi = [
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export function useBookOwnership() {
  const { address, isConnected } = useAccount();
  const [isOwner, setIsOwner] = useState(false);
  
  // Get NFT balance of the connected wallet
  const { data: nftBalance, isLoading } = useReadContract({
    address: bookConfig.nftInfo?.contractAddress as `0x${string}`,
    abi: erc721Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && !!bookConfig.nftInfo?.contractAddress,
    },
  });

  // Get total supply for stats
  const { data: totalSupply } = useReadContract({
    address: bookConfig.nftInfo?.contractAddress as `0x${string}`,
    abi: erc721Abi,
    functionName: "totalSupply",
    query: {
      enabled: !!bookConfig.nftInfo?.contractAddress,
    },
  });

  useEffect(() => {
    if (nftBalance !== undefined) {
      setIsOwner(BigInt(nftBalance) > BigInt(0));
    }
  }, [nftBalance]);

  return { 
    isOwner, 
    loading: isLoading,
    nftBalance,
    totalSupply: totalSupply ? Number(totalSupply) : 0
  };
}
