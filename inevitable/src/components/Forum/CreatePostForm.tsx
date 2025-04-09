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
      console.log("Creating post with title:", title, "and content:", content);
      await forumService.createPost(title, content);
      setTitle('');
      setContent('');
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      
      // TypeScript-safe error handling
      const errorMessage = error instanceof Error ? error.message : 
                           typeof error === 'object' && error !== null && 'message' in error ? 
                           String(error.message) : 'Unknown error';
      
      // If the error is about missing authentication token, prompt for sign-in
      if (errorMessage.includes('Authentication token missing')) {
        alert('Your session has expired. Please sign in again.');
        const success = await onSignIn();
        if (success) {
          // Try again after successful sign-in
          try {
            await forumService.createPost(title, content);
            setTitle('');
            setContent('');
            onPostCreated();
          } catch (retryError) {
            console.error('Error creating post after re-authentication:', retryError);
          }
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="create-post-form">
        <h4>Start a Discussion</h4>
        <div className="auth-prompt">
          <p>Sign in with your wallet to participate in discussions</p>
          <button 
            onClick={onSignIn} 
            className="button primary"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }
  
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
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
