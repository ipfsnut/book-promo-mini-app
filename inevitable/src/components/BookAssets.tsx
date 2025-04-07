import { bookConfig } from '../config';

export function BookAssets() {
  return (
    <div className="book-assets">
      <h3>Additional Resources</h3>
      <div className="resources-links">
        <a 
          href={bookConfig.links.website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="resource-link"
        >
          Official Website
        </a>
      </div>
    </div>
  );
}
