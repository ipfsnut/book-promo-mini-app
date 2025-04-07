import { useState, useEffect } from 'react';
import { fetchBookMetadata } from '../utils/bookMetadata';

interface BookData {
  title?: string;
  description?: string;
  author?: string;
  imageURI?: string;
  contentURI?: string;
  additionalData?: {
    publishedDate?: string;
    format?: string;
    [key: string]: any;
  };
}

interface BookDetailsProps {
  links: {
    ALEXANDRIA: string;
    PERSONAL_SITE: string;
    NOUNSPACE: string;
  };
}

function BookDetails({ links }: BookDetailsProps) {
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getBookData = async () => {
      try {
        const data = await fetchBookMetadata();
        setBookData(data);
      } catch (error) {
        console.error('Error fetching book data:', error);
        // Set fallback data
        setBookData({
          title: 'INEVITABLE: Distributed Cognition & Network Superintelligence',
          description: 'An exploration of distributed cognition and the future of network superintelligence.',
          author: 'EpicDylan'
        });
      } finally {
        setLoading(false);
      }
    };

    getBookData();
  }, []);

  if (loading) {
    return <div className="loading">Loading book details...</div>;
  }

  return (
    <div className="tab-content">
      <div className="book-info">
        <h2>{bookData?.title || 'Distributed Cognition & Network Superintelligence'}</h2>
        <p className="author">By {bookData?.author || 'EpicDylan'}</p>
        <p className="description">
          {bookData?.description || 'An exploration of distributed cognition and the future of network superintelligence. This groundbreaking NFT book examines how collective intelligence may lead to the emergence of network superintelligence.'}
        </p>
        
        <div className="action-buttons">
          <a href={links.ALEXANDRIA} target="_blank" rel="noopener noreferrer" className="action-button">
            Read on Alexandria
          </a>
          <a href={links.PERSONAL_SITE} target="_blank" rel="noopener noreferrer" className="action-button secondary">
            Alternative Options
          </a>
        </div>
      </div>
    </div>
  );
}

export default BookDetails;