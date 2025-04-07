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
      <meta name='fc:frame' content='{"version":"next","imageUrl":"https://oiwymzxncdvipdvgbycw.supabase.co/storage/v1/object/public/public/collections/cover_art_originals/InevitableCover.png","aspectRatio":"3:2","button":{"title":"INEVITABLE","action":{"type":"launch_frame","name":"INEVITABLE","url":"https://getinevitable.com","splashImageUrl":"https://oiwymzxncdvipdvgbycw.supabase.co/storage/v1/object/public/public/collections/cover_art_originals/InevitableCover.png","splashBackgroundColor":"#000000"}}}' />
    </div>
  );
}
