import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi'; // Import useAccount hook
import { useWalletAuth } from '../../hooks/useWalletAuth';
import { forumService } from '../../services/forumService';
import { PostList } from './PostList';
import { PostDetail } from './PostDetail';
import { CreatePostForm } from './CreatePostForm';
import { ForumHeader } from './ForumHeader';
import { bookConfig } from '../../config';

// Define a Post interface to match the structure from the API
interface User {
  id: any;
  wallet_address: string;
  username: string | null;
  avatar_url: string | null;
}

interface CommentCount {
  count: number;
}

interface Post {
  id: any;
  title: string | null;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  users: User;
  comments: CommentCount[];
  // Add any other fields that might be in your post data
}

export function Forum() {
  const { isConnected } = useAccount(); // Get wallet connection status
  const { isAuthenticated, hasAccess, userRole, signIn } = useWalletAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">('list'); // Explicitly typed as union
  
  // Load posts
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const data = await forumService.getPosts();
        setPosts(data as unknown as Post[]);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPosts();
  }, []);
  
  // Handle post selection
  const handleSelectPost = async (post: Post) => {
    setLoading(true);
    try {
      const { post: postDetail, comments } = await forumService.getPost(post.id);
      setSelectedPost({ ...postDetail, comments } as unknown as Post);
      setViewMode('detail');
    } catch (error) {
      console.error('Error loading post details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle back to list
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPost(null);
  };
  
  // Handle post creation
  const handlePostCreated = async () => {
    try {
      const data = await forumService.getPosts();
      setPosts(data as unknown as Post[]);
    } catch (error) {
      console.error('Error refreshing posts:', error);
    }
  };
  
  // If wallet is not connected, show a message to connect
  if (!isConnected) {
    return (
      <div className="forum">
        <h3>INEVITABLE Book Club Forum</h3>
        <div className="access-required">
          <p>Connect your wallet to access the book club forum.</p>
        </div>
      </div>
    );
  }
  
  // If connected but doesn't have access, show a message
  if (isConnected && !hasAccess) {
    return (
      <div className="forum">
        <h3>INEVITABLE Book Club Forum</h3>
        <div className="access-required">
          <p>Access to the forum requires either:</p>
          <ul>
            <li>Owning the INEVITABLE book NFT</li>
            <li>Holding at least 100,000 $NSI tokens in your wallet</li>
          </ul>
          <a href={bookConfig.links.nounspace} target="_blank" rel="noopener noreferrer" className="button primary">
            Get $NSI Tokens
          </a>
          <a href={bookConfig.links.alexandriaBooks} target="_blank" rel="noopener noreferrer" className="button secondary">
            Get the Book NFT
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="forum">
      <ForumHeader 
        viewMode={viewMode} 
        onBackToList={handleBackToList} 
      />
      
      {viewMode === 'list' ? (
        <>
          <CreatePostForm 
            onPostCreated={handlePostCreated} 
            isAuthenticated={isAuthenticated}
            onSignIn={signIn}
          />
          
          <PostList 
            posts={posts} 
            loading={loading} 
            onSelectPost={handleSelectPost} 
            userRole={userRole}
          />
        </>
      ) : (
        <PostDetail 
          post={selectedPost} 
          userRole={userRole} 
          isAuthenticated={isAuthenticated}
          onBackToList={handleBackToList} 
          onSignIn={signIn}
        />
      )}
    </div>
  );
}
