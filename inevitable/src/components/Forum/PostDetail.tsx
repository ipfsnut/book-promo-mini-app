import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { forumService } from '../../services/forumService';
import { Comment } from './Comment';
import { CreateCommentForm } from './CreateCommentForm';

interface PostDetailProps {
  post: any;
  userRole: string;
  isAuthenticated: boolean;
  onBackToList: () => void;
  onSignIn: () => Promise<boolean>;
}

export function PostDetail({ post, userRole, isAuthenticated, onBackToList, onSignIn }: PostDetailProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Load comments when post changes
  useEffect(() => {
    if (post?.comments) {
      setComments(post.comments);
    }
  }, [post]);
  
  // Handle comment creation
  const handleCommentCreated = async () => {
    setLoading(true);
    try {
      const { comments: newComments } = await forumService.getPost(post.id);
      setComments(newComments);
    } catch (error) {
      console.error('Error refreshing comments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await forumService.deleteComment(commentId);
        // Refresh comments after deletion
        const { comments: newComments } = await forumService.getPost(post.id);
        setComments(newComments);
        return true;
      } catch (error) {
        console.error('Error deleting comment:', error);
        return false;
      }
    }
    return false;
  };
  
  if (!post) {
    return (
      <div className="post-detail-loading">
        <p>Loading discussion...</p>
      </div>
    );
  }
  
  // Format timestamp
  const timestamp = new Date(post.created_at);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
  
  return (
    <div className="post-detail">    
      <div className="detail-post">
        <div className="post-header">
          <div className="post-author">
            <span className="author-name">
              {post.users?.username || `${post.users?.wallet_address.substring(0, 6)}...`}
            </span>
          </div>
          <span className="post-time">{timeAgo}</span>
        </div>
        
        {post.title && (
          <h3 className="post-title">{post.title}</h3>
        )}
        
        <div className="post-content">
          <p>{post.content}</p>
        </div>
      </div>
      
      <div className="comments-section">
        <h4>Comments</h4>
        
        {isAuthenticated ? (
          <CreateCommentForm 
            postId={post.id} 
            onCommentCreated={handleCommentCreated} 
          />
        ) : (
          <div className="auth-prompt">
            <p>Sign in with your wallet to join the discussion</p>
            <button 
              onClick={onSignIn} 
              className="button primary"
            >
              Sign In
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="comments-loading">
            <p>Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="no-comments">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <Comment 
                key={comment.id} 
                comment={comment} 
                userRole={userRole}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
