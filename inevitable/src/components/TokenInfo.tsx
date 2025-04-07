import { useEffect, useState } from "react";
import { bookConfig } from "../config";
import { fetchBookStats } from "../api/bookApi";
import { useAccount } from "wagmi";
import { useTokenHolder } from "../hooks/useTokenHolder";

export function TokenInfo() {
  const { isConnected } = useAccount();
  const { isHolder, balance, loading, tokenMetadata } = useTokenHolder();
  const [stats, setStats] = useState({ readers: 0, tokenHolders: 0, totalSupply: 0 });
  
  useEffect(() => {
    const getStats = async () => {
      const bookStats = await fetchBookStats();
      setStats(bookStats);
    };
    
    getStats();
  }, []);

  return (
    <div className="token-info">
      <h3>Join the Book Club</h3>
      
      <div className="token-header">
        {tokenMetadata.image && (
          <img src={tokenMetadata.image} alt={`${bookConfig.tokenInfo.symbol} token`} className="token-image" />
        )}
        <div className="token-details">
          <h4>{bookConfig.tokenInfo.symbol}</h4>
          <p>The official token for INEVITABLE book club</p>
          {tokenMetadata.fid > 0 && (
            <p className="token-fid">Creator FID: {tokenMetadata.fid}</p>
          )}
        </div>
      </div>
      
      <div className="token-stats">
        <div className="stat">
          <span className="stat-value">{stats.readers}</span>
          <span className="stat-label">Readers</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.tokenHolders}</span>
          <span className="stat-label">Club Members</span>
        </div>
        <div className="stat">
          <span className="stat-value">{bookConfig.tokenInfo.symbol}</span>
          <span className="stat-label">Token</span>
        </div>
      </div>
      
      <div className="token-actions">
        <a href={bookConfig.links.nounspace} target="_blank" rel="noopener noreferrer" className="button primary">
          Join Book Club
        </a>
        <a href={bookConfig.links.basescan} target="_blank" rel="noopener noreferrer" className="button secondary">
          Verify Onchain
        </a>
      </div>
      
      {isConnected ? (
        <div className="member-check">
          {loading ? (
            <p>Checking membership status...</p>
          ) : isHolder ? (
            <div className="member-status positive">
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
          ) : (
            <div className="member-status negative">
              <p>You're not a book club member yet.</p>
              <p>Join on Nounspace to access exclusive content and discussions!</p>
            </div>
          )}
        </div>
      ) : (
        <p className="connect-prompt">Connect your wallet to check membership status</p>
      )}
    </div>
  );
}
