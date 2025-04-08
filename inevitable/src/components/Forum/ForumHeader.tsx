interface ForumHeaderProps {
  viewMode: 'list' | 'detail';
  onBackToList: () => void;
}

export function ForumHeader({ viewMode, onBackToList }: ForumHeaderProps) {
  return (
    <div className="forum-header">
      {viewMode === 'detail' ? (
        <div className="detail-header">
          <button 
            className="back-button" 
            onClick={onBackToList}
          >
            ← Back to Discussions
          </button>
          <h3>Discussion</h3>
        </div>
      ) : (
        <h3>INEVITABLE Book Club Forum</h3>
      )}
    </div>
  );
}
