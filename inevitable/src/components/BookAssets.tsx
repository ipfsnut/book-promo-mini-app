import { useEffect, useState } from "react";
import { fetchBookAssets, BookAsset } from "../api/bookApi";
import { useAccount } from "wagmi";
import { useBookOwnership } from "../hooks/useBookOwnership";

export function BookAssets() {
  const { isConnected } = useAccount();
  const { isOwner } = useBookOwnership();
  const [assets, setAssets] = useState<BookAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAssets = async () => {
      setLoading(true);
      try {
        const bookAssets = await fetchBookAssets();
        setAssets(bookAssets);
      } catch (error) {
        console.error("Error fetching book assets:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getAssets();
  }, []);

  if (loading) {
    return <div className="assets-loading">Loading book assets...</div>;
  }

  if (assets.length === 0) {
    return null;
  }

  return (
    <div className="book-assets">
      <h3>Book Assets</h3>
      
      {!isConnected ? (
        <p className="connect-prompt">Connect your wallet to access book assets</p>
      ) : !isOwner ? (
        <p className="ownership-required">You need to own the book NFT to access these assets</p>
      ) : (
        <div className="assets-grid">
          {assets.map((asset) => (
            <a 
              key={asset.id} 
              href={asset.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="asset-card"
            >
              {asset.type === 'image' ? (
                <img src={asset.url} alt={asset.title} className="asset-image" />
              ) : (
                <div className={`asset-icon asset-${asset.type}`}>{asset.type}</div>
              )}
              <div className="asset-title">{asset.title}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
