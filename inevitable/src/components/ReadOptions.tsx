import { bookConfig } from "../config";

export function ReadOptions() {
  return (
    <div className="read-options">
      <h3>Read the Book</h3>
      <div className="options-grid">
        <a href={bookConfig.links.alexandriaBooks} target="_blank" rel="noopener noreferrer" className="option-card">
          <h4>Read Onchain</h4>
          <p>Experience INEVITABLE on Alexandria Books</p>
        </a>
        <a href={bookConfig.links.website} target="_blank" rel="noopener noreferrer" className="option-card">
          <h4>Physical Copy</h4>
          <p>Order a physical copy or ebook</p>
        </a>
      </div>
    </div>
  );
}
