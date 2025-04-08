import { useState } from 'react';
import { forumService } from '../../services/forumService';

interface CreatePostFormProps {
  onPostCreated: () => void;
  isAuthenticated: boolean;
  onSignIn: () => Promise<boolean>;
}

export function CreatePostForm({ onPostCreated, isAuthenticated, onSignIn }: CreatePostFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // If not authenticated, prompt for sign-in first
      const success = await onSignIn();
      if (!success) return;
    }
    
    setIsSubmitting(true);
    
    try {
      await forumService.createPost(title, content);
      setTitle('');
      setContent('');
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="create-post-form">
      <h4>Start a Discussion</h4>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="post-title-input"
        />
        
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="post-content-input"
        />
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="button primary"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? 'Posting...' : isAuthenticated ? 'Post' : 'Sign & Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
