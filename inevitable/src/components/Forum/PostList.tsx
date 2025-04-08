import { useState, useEffect } from 'react';
import { Post } from './Post';
import { forumService } from '../../services/forumService';

interface PostListProps {
  posts: any[];
  loading: boolean;
  onSelectPost: (post: any) => void;
  userRole: string;
}

export function PostList({ posts: initialPosts, loading, onSelectPost, userRole }: PostListProps) {
  const [localPosts, setLocalPosts] = useState(initialPosts);
  
  // Update local posts when props change
  useEffect(() => {
    setLocalPosts(initialPosts);
  }, [initialPosts]);
  
  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    try {
      await forumService.deletePost(postId);
      setLocalPosts(localPosts.filter(post => post.id !== postId));
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  };
  
  // Handle post pinning
  const handleTogglePin = async (postId: string, isPinned: boolean) => {
    try {
      await forumService.updatePost(postId, { is_pinned: isPinned }); // Changed from togglePinPost to updatePost
      
      // Update the local state to reflect the change
      const updatedPosts = localPosts.map(post => 
        post.id === postId ? { ...post, is_pinned: isPinned } : post
      );
      
      // Sort posts to ensure pinned posts are at the top
      updatedPosts.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setLocalPosts(updatedPosts);
      return true;
    } catch (error) {
      console.error('Error toggling pin status:', error);
      return false;
    }
  };
  
  if (loading) {
    return (
      <div className="posts-loading">
        <p>Loading discussions...</p>
      </div>
    );
  }
  
  if (localPosts.length === 0) {
    return (
      <div className="no-posts">
        <p>No discussions yet. Start the first one!</p>
      </div>
    );
  }
  
  return (
    <div className="post-list">
      {localPosts.map((post) => (
        <Post 
          key={post.id} 
          post={post} 
          onSelect={onSelectPost} 
          userRole={userRole}
          onDelete={handleDeletePost}
          onTogglePin={handleTogglePin}
        />
      ))}
    </div>
  );
}
