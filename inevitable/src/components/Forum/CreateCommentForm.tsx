import { useState } from 'react';
import { forumService } from '../../services/forumService';

interface CreateCommentFormProps {
  postId: string | number;
  onCommentCreated: () => void;
}

export function CreateCommentForm({ postId, onCommentCreated }: CreateCommentFormProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      await forumService.createComment(postId, comment);
      setComment('');
      onCommentCreated();
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="create-comment-form">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          className="comment-input"
        />
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="button primary"
            disabled={isSubmitting || !comment.trim()}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
    </div>
  );
}
