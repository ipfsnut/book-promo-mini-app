import { bookConfig } from "../config";

export function BookCover() {
  return (
    <div className="book-cover">
      <img 
        src={bookConfig.coverImage} 
        alt={`${bookConfig.title} by ${bookConfig.author}`} 
        className="book-image"
      />
    </div>
  );
}
