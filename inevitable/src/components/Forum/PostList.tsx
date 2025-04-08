import { Post } from './Post';
import { forumService } from '../../services/forumService';

interface PostListProps {
  posts: any[];
  loading: boolean;
  onSelectPost: (post: any) => void;
  userRole: string;
}

export function PostList({ posts, loading, onSelectPost, userRole }: PostListProps) {
  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await forumService.deletePost(postId);
        // Refresh posts after deletion
        const data = await forumService.getPosts();
        setPosts(data);
        return true;
      } catch (error) {
        console.error('Error deleting post:', error);
        return false;
      }
    }
    return false;
  };
  
  // Handle post pinning
  const handleTogglePin = async (postId: string, isPinned: boolean) => {
    try {
      await forumService.togglePinPost(postId, !isPinned);
      // Refresh posts after pinning
      const data = await forumService.getPosts();
      setPosts(data);
      return true;
    } catch (error) {
      console.error('Error toggling pin status:', error);
      return false;
    }
  };
  
  if (loading && posts.length === 0) {
    return (
      <div className="posts-loading">
        <p>Loading discussions...</p>
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="no-posts">
        <p>No discussions yet. Be the first to start a conversation!</p>
      </div>
    );
  }
  
  return (
    <div className="posts-list">
      {posts.map((post) => (
        <Post 
          key={post.id} 
          post={post} 
          userRole={userRole}
          onSelect={onSelectPost}
          onDelete={handleDeletePost}
          onTogglePin={handleTogglePin}
        />
      ))}
    </div>
  );
}
