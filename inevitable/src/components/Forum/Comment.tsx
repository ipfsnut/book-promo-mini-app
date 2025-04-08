import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { authService } from '../../services/authService';

interface CommentProps {
  comment: any;
  userRole: string;
  onDelete: (commentId: string) => Promise<boolean>;
}

export function Comment({ comment, userRole, onDelete }: CommentProps) {
  const [showModTools, setShowModTools] = useState(false);
  
  // Get current user
  const currentUser = authService.getCurrentUser();
  
  // Check if user is comment creator
  const isCreator = currentUser?.userId === comment.user_id;
  
  // Format timestamp
  const timestamp = new Date(comment.created_at);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
  
  // Handle comment deletion
  const handleDelete = async (e) => {
    e.stopPropagation();
    await onDelete(comment.id);
  };
  
  // Determine if user can delete this comment
  const canDelete = 
    isCreator || 
    userRole === 'admin' || 
    userRole === 'moderator';
  
  return (
    <div 
      className="forum-comment"
      onMouseEnter={() => setShowModTools(true)}
      onMouseLeave={() => setShowModTools(false)}
    >
      <div className="comment-header">
        <div className="comment-author">
          <span className="author-name">
            {comment.users.username || `${comment.users.wallet_address.substring(0, 6)}...`}
          </span>
        </div>
        
        <div className="comment-meta">
          <span className="comment-time">{timeAgo}</span>
          
          {showModTools && canDelete && (
            <div className="mod-tools">
              <button 
                className="mod-tool-btn delete"
                onClick={handleDelete}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="comment-content">
        <p>{comment.content}</p>
      </div>
    </div>
  );
}
