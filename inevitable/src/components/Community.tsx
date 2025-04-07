import React from 'react';

interface CommunityProps {
  links: {
    ALEXANDRIA: string;
    PERSONAL_SITE: string;
    NOUNSPACE: string;
  };
}

function Community({ links }: CommunityProps) {
  return (
    <div className="tab-content">
      <div className="community-info">
        <h2>INEVITABLE Community</h2>
        <p>Join the conversation about distributed cognition and network superintelligence.</p>
        
        <div className="community-links">
          <div className="community-link">
            <h3>Nounspace</h3>
            <p>Join our Nounspace community to discuss the book and connect with other readers.</p>
            <a 
              href={links.NOUNSPACE} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="action-button"
            >
              Visit Nounspace
            </a>
          </div>
          
          <div className="community-link">
            <h3>Author</h3>
            <p>Follow EpicDylan to stay updated on his latest work and thoughts.</p>
            <a 
              href={links.PERSONAL_SITE} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="action-button secondary"
            >
              Author's Site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Community;