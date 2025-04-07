import { useEffect, useState } from "react";
import { fetchBookAssets, BookAsset } from "../api/bookApi";

export function BookAssets() {
  const [assets, setAssets] = useState<BookAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAssets = async () => {
      setLoading(true);
      const bookAssets = await fetchBookAssets();
      setAssets(bookAssets);
      setLoading(false);
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
              <div className="asset-text">{asset.title}</div>
            )}
            <div className="asset-title">{asset.title}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
