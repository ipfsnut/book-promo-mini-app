import { sdk } from "@farcaster/frame-sdk";
import { useEffect } from "react";
import { BookCover } from "./components/BookCover";
import { BookInfo } from "./components/BookInfo";
import { ReadOptions } from "./components/ReadOptions";
import { TokenInfo } from "./components/TokenInfo";
import { BookAssets } from "./components/BookAssets";
import { ConnectButton } from "./components/ConnectButton";
import { Forum } from "./components/Forum";
import { DebugInfo } from "./components/DebugInfo";
import { DebugHeaders } from "./components/DebugHeaders";


function App() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <div className="app-container">
      {import.meta.env.DEV && <DebugInfo />}
      <DebugHeaders />
      <header className="app-header">
        <h1>INEVITABLE</h1>
        <div className="connect-wrapper">
          <ConnectButton />
        </div>
      </header>
      
      <main className="book-showcase">
        <div className="book-hero">
          <BookCover />
          <BookInfo />
        </div>
        
        <ReadOptions />
        <TokenInfo />
        <Forum />
        <BookAssets />
      </main>
      
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} T. Dylan Daniel. All rights reserved.</p>
        <p>Built on Farcaster</p>
      </footer>
    </div>
  );
}

export default App;
