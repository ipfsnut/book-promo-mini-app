import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { authService } from '../../services/authService';
import { useEffect } from 'react';



interface CommentProps {
  comment: any;
  userRole: string;
  onDelete: (commentId: string) => Promise<boolean>;
}

export function Comment({ comment, userRole, onDelete }: CommentProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Get current user to check if they're the author
  useEffect(() => {
    const getUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    };
    getUser();
  }, []);
  
  const isAuthor = user && user.id === comment.user_id; // Changed from userId to user_id
  
  // Format timestamp
  const timestamp = new Date(comment.created_at);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
  
  const handleDelete = async (e: React.MouseEvent) => { // Added type annotation
    e.preventDefault();
    setIsDeleting(true);
    const success = await onDelete(comment.id);
    if (!success) setIsDeleting(false);
  };
  
  return (
    <div className="comment">
      <div className="comment-header">
        <div className="comment-author">
          <span className="author-name">
            {comment.users.username || `${comment.users.wallet_address.substring(0, 6)}...`}
          </span>
        </div>
        <span className="comment-time">{timeAgo}</span>
      </div>
      
      <div className="comment-content">
        <p>{comment.content}</p>
      </div>
      
      {(isAuthor || userRole === 'admin') && (
        <div className="comment-actions">
          <button 
            onClick={handleDelete} 
            className="delete-button"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  );
}
