import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { bookConfig } from "../config";

// Full ABI for the $NSI token
const nsiTokenAbi = [
  {"inputs":[{"internalType":"string","name":"name_","type":"string"},{"internalType":"string","name":"symbol_","type":"string"},{"internalType":"uint256","name":"maxSupply_","type":"uint256"},{"internalType":"address","name":"deployer_","type":"address"},{"internalType":"uint256","name":"fid_","type":"uint256"},{"internalType":"string","name":"image_","type":"string"},{"internalType":"string","name":"castHash_","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},
  {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},
  {"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},
  {"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},
  {"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},
  {"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},
  {"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"castHash","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"deployer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"fid","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"image","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}
] as const;

export function useTokenHolder() {
  const { address, isConnected } = useAccount();
  const [isHolder, setIsHolder] = useState(false);
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [tokenMetadata, setTokenMetadata] = useState({
    image: "",
    castHash: "",
    fid: 0
  });

  // Get token balance
  const { data: tokenBalance } = useReadContract({
    address: bookConfig.tokenInfo.contractAddress as `0x${string}`,
    abi: nsiTokenAbi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Get token decimals
  const { data: decimals } = useReadContract({
    address: bookConfig.tokenInfo.contractAddress as `0x${string}`,
    abi: nsiTokenAbi,
    functionName: "decimals",
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Get token image
  const { data: tokenImage } = useReadContract({
    address: bookConfig.tokenInfo.contractAddress as `0x${string}`,
    abi: nsiTokenAbi,
    functionName: "image",
    query: {
      enabled: isConnected,
    },
  });

  // Get token castHash
  const { data: tokenCastHash } = useReadContract({
    address: bookConfig.tokenInfo.contractAddress as `0x${string}`,
    abi: nsiTokenAbi,
    functionName: "castHash",
    query: {
      enabled: isConnected,
    },
  });

  // Get token fid
  const { data: tokenFid } = useReadContract({
    address: bookConfig.tokenInfo.contractAddress as `0x${string}`,
    abi: nsiTokenAbi,
    functionName: "fid",
    query: {
      enabled: isConnected,
    },
  });

  // Update token metadata when available
  useEffect(() => {
    if (tokenImage || tokenCastHash || tokenFid) {
      setTokenMetadata({
        image: tokenImage || "",
        castHash: tokenCastHash || "",
        fid: tokenFid ? Number(tokenFid) : 0
      });
    }
  }, [tokenImage, tokenCastHash, tokenFid]);

  // Format balance with proper decimals
  useEffect(() => {
    if (tokenBalance) {
      setLoading(true);
      const balanceValue = tokenBalance.toString();
      
      // Format the balance with the correct number of decimals
      if (decimals !== undefined) {
        const divisor = BigInt(10) ** BigInt(decimals);
        const wholePart = BigInt(balanceValue) / divisor;
        const fractionalPart = BigInt(balanceValue) % divisor;
        
        // Format to show decimals properly (but trim trailing zeros)
        let fractionalStr = fractionalPart.toString().padStart(Number(decimals), '0');
        // Remove trailing zeros
        fractionalStr = fractionalStr.replace(/0+$/, '');
        
        const formattedBalance = `${wholePart}${
          fractionalStr.length > 0 
            ? `.${fractionalStr}` 
            : ''
        }`;
        
        setBalance(formattedBalance);
      } else {
        setBalance(balanceValue);
      }
      
      setIsHolder(BigInt(balanceValue) > BigInt(0));
      setLoading(false);
    }
  }, [tokenBalance, decimals]);

  return { 
    isHolder, 
    balance, 
    loading,
    tokenMetadata
  };
}
