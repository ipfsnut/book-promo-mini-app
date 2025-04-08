import { useState } from "react";
import { bookConfig } from "../config";

export function BookInfo() {
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const shortDescription = "A groundbreaking exploration of technology and humanity's future.";
  
  const fullDescription = `Modern science has done an extremely good job of getting to the bottom of a number of tough problems in information theory and the study of cognition. It is therefore surprising to see that the concept of artificial intelligence has derailed into speculation about intelligent machines. This book presents a contrasting vision of the future of intelligence. Instead of assuming that artificial general intelligence is on the way, the time has come to reconsider the way we think about AI in light of the facts that emerge from a careful study of the intelligence found in living minds.

AI is a mere computer program, but it is special because it can quickly navigate the digital records human beings have been making as we share our culture, our ideas, and our thoughts with one another online and via literature and speech. Minds are the origin of the material that large language models are made out of, but too many researchers have reached the wrong conclusions about the differences between biological intelligence and artificial intelligence. INEVITABLE: Distributed Cognition & Network Superntelligence is written to explore the ways in which people are already using network technologies to organize and share a staggering amount of information with each other.

Enter the vision of a future in which people have learned to proactively organize around our shared bodies of knowledge, of collective human intelligence. Language brings us the ability to share our mental processes with other people around the world as we build our social networks and move forward into an ever-more-connected way of life. Providing individuals with ever-increasing access to information has been a developing goal of modern technology for some time now. As distributed systems technologies improve, it will become increasingly important to maintain the shared collective human intelligence.`;

  return (
    <div className="book-info">
      <h1 className="book-title">{bookConfig.title}</h1>
      <h2 className="book-author">by {bookConfig.author}</h2>
      
      <div className="book-description">
        {showFullDescription ? (
          <>
            <p>{fullDescription}</p>
            <button 
              className="description-toggle" 
              onClick={() => setShowFullDescription(false)}
            >
              Show Less
            </button>
          </>
        ) : (
          <>
            <p>{shortDescription}</p>
            <button 
              className="description-toggle" 
              onClick={() => setShowFullDescription(true)}
            >
              Read Full Description
            </button>
          </>
        )}
      </div>
      
      {/* Add Alexandria Labs logo */}
      <div className="technology-partner">
        <p>Book experience powered by:</p>
        <a href={bookConfig.links.alexandriaBooks} target="_blank" rel="noopener noreferrer">
          <img 
            src="/AlexandriaLabs.png" 
            alt="Alexandria Labs" 
            className="partner-logo alexandria-logo" 
          />
        </a>
      </div>
    </div>
  );
}
