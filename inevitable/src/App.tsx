import { useState, useEffect } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { useFrame } from '@farcaster/frame';
import BookDetails from './components/BookDetails';
import TokenPrice from './components/TokenPrice';
import Community from './components/Community';
import './App.css';

// Links configuration
export const LINKS = {
  ALEXANDRIA: 'https://www.alexandriabooks.com/collection/inevitable',
  PERSONAL_SITE: 'https://epicdylan.com/getinevitable',
  NOUNSPACE: 'https://www.nounspace.com/t/base/0x1696688A7828E227E64953C371aC0B57d5974B55/Profile'
};

function App() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('book');
  const frame = useFrame();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Tell Farcaster we're ready to hide the splash screen
    const initialize = async () => {
      try {
        if (frame) {
          await frame.ready();
        }
      } catch (error) {
        console.error('Error initializing frame:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [frame]);

  // Handle tab changes
  useEffect(() => {
    const tab = location.pathname.split('/')[1] || 'book';
    setActiveTab(tab || 'book');
  }, [location]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading INEVITABLE...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>INEVITABLE</h1>
        <div className="app-logo">
          <img 
            src="https://epicdylan.com/inevitable-icon.png" 
            alt="INEVITABLE Logo" 
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = 'https://epicdylan.com/inevitable-cover.jpg';
            }}
          />
        </div>
      </header>
      
      <main className="app-main">
        <div className="book-cover">
          <img 
            src="https://epicdylan.com/inevitable-cover.jpg" 
            alt="INEVITABLE book cover" 
            id="bookCover"
          />
        </div>
        
        <div className="tab-container">
          <div className="tabs">
            <Link 
              to="/" 
              className={`tab ${activeTab === 'book' ? 'active' : ''}`}
              onClick={() => setActiveTab('book')}
            >
              Book Details
            </Link>
            <Link 
              to="/token" 
              className={`tab ${activeTab === 'token' ? 'active' : ''}`}
              onClick={() => setActiveTab('token')}
            >
              $NSI Token
            </Link>
          </div>
          
          <div className="tab-content-container">
            <Routes>
              <Route path="/" element={<BookDetails links={LINKS} />} />
              <Route path="/token" element={<TokenPrice links={LINKS} />} />
              <Route path="/community" element={<Community links={LINKS} />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;