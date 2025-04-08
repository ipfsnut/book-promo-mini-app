import { bookConfig } from "../config";
import { useAccount, useReadContract, useChainId } from "wagmi";
import { useTokenHolder } from "../hooks/useTokenHolder";
import { useBookOwnership } from "../hooks/useBookOwnership";
import { base } from "wagmi/chains";

// Full implementation contract ABI
const bookContractAbi = [
  // totalSupply function
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // collectionParameters function
  {
    "inputs": [],
    "name": "collectionParameters",
    "outputs": [
      {"internalType": "uint256", "name": "maxSupply", "type": "uint256"},
      {"internalType": "uint256", "name": "availableToMintDate", "type": "uint256"},
      {"internalType": "uint256", "name": "price", "type": "uint256"},
      {"internalType": "uint256", "name": "walletLimit", "type": "uint256"},
      {"internalType": "uint96", "name": "secondaryRoyaltyPercentage", "type": "uint96"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export function TokenInfo() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const isBaseChain = chainId === base.id;
  
  const { isHolder, balance, loading: tokenLoading, tokenMetadata } = useTokenHolder();
  const { isOwner, loading: nftLoading, totalSupply: bookOwnerCount } = useBookOwnership();
  
  // Get total supply from the NFT contract - only if we don't have it from useBookOwnership
  const { data: nftTotalSupply, isLoading: nftSupplyLoading } = useReadContract({
    address: bookConfig.nftInfo?.contractAddress as `0x${string}`,
    abi: bookContractAbi,
    functionName: "totalSupply",
    query: {
      enabled: !!bookConfig.nftInfo?.contractAddress && bookOwnerCount === 0 && isBaseChain,
    },
  });

  // Get collection parameters from the NFT contract
  const { data: collectionParams } = useReadContract({
    address: bookConfig.nftInfo?.contractAddress as `0x${string}`,
    abi: bookContractAbi,
    functionName: "collectionParameters",
    query: {
      enabled: !!bookConfig.nftInfo?.contractAddress && isBaseChain,
    },
  });

  // Calculate the max supply and sold percentage
  const maxSupply = collectionParams ? Number(collectionParams[0]) : 0;
  const soldSupply = bookOwnerCount > 0 ? bookOwnerCount : (nftTotalSupply ? Number(nftTotalSupply) : 0);
  const soldPercentage = maxSupply > 0 ? Math.round((soldSupply / maxSupply) * 100) : 0;

  // If connected but not on Base chain, show a prompt
  if (isConnected && !isBaseChain) {
    return (
      <div className="token-info">
        <h3>Wrong Network</h3>
        <div className="network-warning">
          <p>Please connect to Base network in your wallet to view book information.</p>
          <p>The INEVITABLE book and token contracts are deployed on Base.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="token-info">
      <h3>Join the Book Club</h3>
      
      <div className="token-header">
        <div className="token-details">
          <h4>{bookConfig.tokenInfo.symbol}</h4>
          <p>The official token for INEVITABLE book club is $NSI, a Clanker memecoin on Base. Hold 10k $NSI to join the book club's private chat, powered by Nounspace.</p>
          {tokenMetadata.fid > 0 && (
            <p className="token-fid">Creator FID: {tokenMetadata.fid}</p>
          )}
          
          {/* Add Nouns logo */}
          <div className="technology-partner">
            <p>Book club powered by:</p>
            <a href={bookConfig.links.nounspace} target="_blank" rel="noopener noreferrer">
              <img 
                src="/nouns.png" 
                alt="Nouns" 
                className="partner-logo nouns-logo" 
              />
            </a>
          </div>
        </div>
      </div>
      
      <div className="token-stats">
        <div className="stat">
          <span className="stat-value">
            {nftSupplyLoading ? "Loading..." : soldSupply.toLocaleString()}
          </span>
          <span className="stat-label">Book Owners</span>
        </div>
        <div className="stat">
          <span className="stat-value">77</span>
          <span className="stat-label">Token Supply</span>
        </div>
        {maxSupply > 0 && (
          <div className="stat">
            <span className="stat-value">{soldPercentage}%</span>
            <span className="stat-label">Sold</span>
          </div>
        )}
      </div>
      
      <div className="token-actions">
        <a href={bookConfig.links.nounspace} target="_blank" rel="noopener noreferrer" className="button primary">
          Join Book Club
        </a>
        <a href={bookConfig.links.alexandriaBooks} target="_blank" rel="noopener noreferrer" className="button secondary">
          Read on Alexandria
        </a>
      </div>
      
      {isConnected ? (
        <div className="member-check">
          {tokenLoading || nftLoading ? (
            <p>Checking membership status...</p>
          ) : (
            <div className={`member-status ${isHolder || isOwner ? 'positive' : 'negative'}`}>
              {isHolder && (
                <div className="token-status">
                  <p>✅ You're a book club member!</p>
                  <p>Balance: {balance} {bookConfig.tokenInfo.symbol}</p>
                  {tokenMetadata.castHash && (
                    <a 
                      href={`https://warpcast.com/~/cast/${tokenMetadata.castHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="token-cast-link"
                    >
                      View original cast
                    </a>
                  )}
                </div>
              )}
              
              {isOwner && (
                <div className="nft-status">
                  <p>✅ You own the INEVITABLE book NFT!</p>
                  <p>You have access to read the book on Alexandria Books.</p>
                </div>
              )}
              
              {!isHolder && !isOwner && (
                <div>
                  <p>You're not a book club member yet.</p>
                  <p>Join on Nounspace to access exclusive content and discussions!</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="connect-prompt">Connect your wallet to check membership status</p>
      )}
    </div>
  );
}
