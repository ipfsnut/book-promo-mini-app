import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { formatDistanceToNow } from 'date-fns';

interface PostProps {
  post: any;
  userRole: string;
  onSelect: (post: any) => void;
  onDelete: (postId: string) => Promise<boolean>;
  onTogglePin: (postId: string, isPinned: boolean) => Promise<boolean>;
}

export function Post({ post, userRole, onSelect, onDelete, onTogglePin }: PostProps) {
  const [showModTools, setShowModTools] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Get current user using useEffect to handle the Promise
  useEffect(() => {
    const fetchUser = async () => {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    };
    
    fetchUser();
  }, []);
  
  // Check if user is post creator
  const isCreator = currentUser?.id === post.user_id;
  
  // Format timestamp
  const timestamp = new Date(post.created_at);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
  
  // Handle post deletion
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent post selection
    await onDelete(post.id);
  };
  
  // Handle post pinning
  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent post selection
    await onTogglePin(post.id, post.is_pinned);
  };
  
  // Determine if user can delete this post
  const canDelete = 
    isCreator || 
    userRole === 'admin' || 
    userRole === 'moderator';
  
  // Determine if user can pin this post
  const canPin = userRole === 'admin' || userRole === 'moderator';
  
  return (
    <div 
      className={`forum-post ${post.is_pinned ? 'pinned' : ''}`}
      onClick={() => onSelect(post)}
      onMouseEnter={() => setShowModTools(true)}
      onMouseLeave={() => setShowModTools(false)}
    >
      {post.is_pinned && (
        <div className="pinned-indicator">
          📌 Pinned
        </div>
      )}
      
      <div className="post-header">
        <div className="post-author">
          <span className="author-name">
            {post.users.username || `${post.users.wallet_address.substring(0, 6)}...`}
          </span>
        </div>
        
        <div className="post-meta">
          <span className="post-time">{timeAgo}</span>
          
          {showModTools && (
            <div className="mod-tools">
              {canDelete && (
                <button 
                  className="mod-tool-btn delete"
                  onClick={handleDelete}
                  title="Delete"
                >
                  🗑️
                </button>
              )}
              
              {canPin && (
                <button 
                  className="mod-tool-btn pin"
                  onClick={handleTogglePin}
                  title={post.is_pinned ? "Unpin" : "Pin"}
                >
                  📌
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {post.title && (
        <h4 className="post-title">{post.title}</h4>
      )}
      
      <div className="post-content">
        <p>{post.content}</p>
      </div>
      
      <div className="post-footer">
        <div className="post-stats">
          <span className="comments-count">
            {post.comments && post.comments[0] ? post.comments[0].count : 0} comments
          </span>
        </div>
        
        <button className="view-discussion-btn">
          View Discussion
        </button>
      </div>
    </div>
  );
}
