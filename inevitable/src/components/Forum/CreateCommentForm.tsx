import { useState } from 'react';
import { forumService } from '../../services/forumService';

interface CreateCommentFormProps {
  postId: string;
  onCommentCreated: () => void;
}

export function CreateCommentForm({ postId, onCommentCreated }: CreateCommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await forumService.addComment(postId, content);
      setContent('');
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
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          className="comment-input"
          disabled={isSubmitting}
        />
        <div className="form-actions">
          <button 
            type="submit" 
            className="button primary"
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
    </div>
  );
}
