import { useState, useEffect } from 'react';
import { fetchNSITokenData } from '../utils/tokenPrice';

interface TokenData {
  symbol: string;
  name: string;
  price: string;
  priceChange24h: string;
  liquidity: string | number;
  volume24h: string | number;
  marketCap?: string | number;
  pairAddress?: string;
  dexId?: string;
}

interface TokenPriceProps {
  links: {
    ALEXANDRIA: string;
    PERSONAL_SITE: string;
    NOUNSPACE: string;
  };
}

function formatNumber(num: string | number): string {
  return new Intl.NumberFormat('en-US', { 
    maximumFractionDigits: 0 
  }).format(typeof num === 'string' ? parseFloat(num) : num);
}

function TokenPrice({ links }: TokenPriceProps) {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getTokenData = async () => {
      try {
        const data = await fetchNSITokenData();
        setTokenData(data);
      } catch (error) {
        console.error('Error fetching token data:', error);
        // Set fallback data
        setTokenData({
          symbol: 'NSI',
          name: 'Network Superintelligence',
          price: '0.00000123',
          priceChange24h: '5.2',
          liquidity: '25000',
          volume24h: '3500'
        });
      } finally {
        setLoading(false);
      }
    };

    getTokenData();
  }, []);

  if (loading) {
    return <div className="loading">Loading token data...</div>;
  }

  const priceChange = parseFloat(tokenData?.priceChange24h || '0');
  const isPriceUp = priceChange >= 0;
  
  return (
    <div className="tab-content">
      <div className="token-info">
        <h2>${tokenData?.symbol} Token</h2>
        <p>The Network Superintelligence memecoin represents the concepts and community behind INEVITABLE.</p>
        
        <div className="token-data-container">
          <div className="token-data">
            <span>Current Price:</span>
            <span className="token-value">${parseFloat(tokenData?.price || '0').toFixed(8)}</span>
          </div>
          <div className="token-data">
            <span>24h Change:</span>
            <span className={`token-value ${isPriceUp ? 'positive' : 'negative'}`}>
              {isPriceUp ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
          <div className="token-data">
            <span>Liquidity:</span>
            <span className="token-value">${formatNumber(tokenData?.liquidity || 0)}</span>
          </div>
          <div className="token-data">
            <span>Volume (24h):</span>
            <span className="token-value">${formatNumber(tokenData?.volume24h || 0)}</span>
          </div>
        </div>
        
        <div className="action-buttons">
          <a 
            href="https://app.baseswap.fi/swap" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="action-button"
          >
            Buy $NSI
          </a>
          <a 
            href={links.NOUNSPACE} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="action-button secondary"
          >
            Join Community
          </a>
        </div>
      </div>
    </div>
  );
}

export default TokenPrice;