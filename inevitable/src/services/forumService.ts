import { authService } from './authService';

export const forumService = {
  // Get all posts
  async getPosts() {
    try {
      const supabase = authService.getClient();
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, 
          title, 
          content, 
          is_pinned,
          created_at,
          updated_at,
          users (id, wallet_address, username, avatar_url),
          comments (count)
        `)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },
  
  // Get a single post with its comments
  async getPost(postId: string | number) {
    try {
      const supabase = authService.getClient();
      // Get the post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select(`
          id, 
          title, 
          content, 
          is_pinned,
          created_at,
          updated_at,
          users (id, wallet_address, username, avatar_url)
        `)
        .eq('id', postId)
        .single();
      
      if (postError) throw postError;
      
      // Get the comments for this post
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          users (id, wallet_address, username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (commentsError) throw commentsError;
      
      return { post, comments: comments || [] };
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  },
  
  // Create a new post
  async createPost(title: string | null, content: string) {
    // Check if user is authenticated
    const user = await authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      // Get the client
      const supabase = authService.getClient();
      
      // Check for access based on token/NFT ownership
      const walletAddress = localStorage.getItem('walletAddress');
      if (!walletAddress) {
        throw new Error('Wallet address not found in localStorage');
      }
      
      const hasNFTAccess = localStorage.getItem('hasNFTAccess') === 'true';
      const hasTokenAccess = localStorage.getItem('hasTokenAccess') === 'true';
      
      if (!hasNFTAccess && !hasTokenAccess) {
        throw new Error('You must own the INEVITABLE book NFT or $NSI tokens to post');
      }
      
      console.log(`Creating post with user_id: ${user.id} for wallet: ${walletAddress}`);
      
      const { data, error } = await supabase
        .from('posts')
        .insert([
          { 
            title: title || null, // Handle empty title
            content,
            user_id: user.id
          }
        ])
        .select();
      
      if (error) {
        console.error("Post creation error details:", error);
        
        // If we have an RLS policy violation, check what's wrong
        if (error.code === '42501' || error.code === '401') {
          console.log("RLS policy violation - checking auth details...");
          
          // Check verification token
          const verificationToken = localStorage.getItem('verificationToken');
          if (!verificationToken) {
            throw new Error('Authentication token missing. Please sign in again.');
          }
          
          // Try to refresh the token and authentication
          const refreshSuccess = await authService.refreshAuthenticationStatus();
          if (!refreshSuccess) {
            throw new Error('Authentication failed. Please sign in again.');
          }
          
          // Try once more with fresh headers
          const { data: retryData, error: retryError } = await supabase
            .from('posts')
            .insert([{ 
              title: title || null,
              content,
              user_id: user.id
            }])
            .select();
          
          if (retryError) {
            console.error("Retry error:", retryError);
            
            // Special handling for specific error codes
            if (retryError.code === '23505') {
              throw new Error('This post may have been created already. Please refresh the page.');
            } else {
              throw new Error('Failed to create post after authentication refresh');
            }
          }
          
          return retryData;
        }
        
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },
  
  // Create a new comment
  async createComment(postId: string | number, content: string) {
    // Check if user is authenticated
    const user = await authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      const supabase = authService.getClient();
      
      // Check for access based on token/NFT ownership
      const walletAddress = localStorage.getItem('walletAddress');
      if (!walletAddress) {
        throw new Error('Wallet address not found in localStorage');
      }
      
      const hasNFTAccess = localStorage.getItem('hasNFTAccess') === 'true';
      const hasTokenAccess = localStorage.getItem('hasTokenAccess') === 'true';
      
      if (!hasNFTAccess && !hasTokenAccess) {
        throw new Error('You must own the INEVITABLE book NFT or $NSI tokens to comment');
      }
      
      // Create the comment
      const { data: comment, error: commentError } = await supabase
        .from('comments')
        .insert([
          { 
            content,
            post_id: postId,
            user_id: user.id
          }
        ])
        .select();
    
      if (commentError) {
        // Handle RLS policy violation
        if (commentError.code === '42501' || commentError.code === '401') {
          // Try to refresh the authentication
          const refreshSuccess = await authService.refreshAuthenticationStatus();
          if (!refreshSuccess) {
            throw new Error('Authentication failed. Please sign in again.');
          }
          
          // Try once more with fresh headers
          const { data: retryData, error: retryError } = await supabase
            .from('comments')
            .insert([{ 
              content,
              post_id: postId,
              user_id: user.id
            }])
            .select();
          
          if (retryError) {
            console.error("Retry error:", retryError);
            throw new Error('Failed to create comment after authentication refresh');
          }
          
          // Update the post's updated_at timestamp
          await supabase
            .from('posts')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', postId);
            
          return retryData;
        }
        
        throw commentError;
      }
    
      // Update the post's updated_at timestamp
      const { error: postError } = await supabase
        .from('posts')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', postId);
    
      if (postError) throw postError;
    
      return comment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },
  
  // Delete a post (admin or author only)
  async deletePost(postId: string | number) {
    // Check if user is authenticated
    const user = await authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      const supabase = authService.getClient();
      
      // First check if user is the author or an admin
      const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      const isAdmin = roleData?.role === 'admin';
      const isAuthor = post.user_id === user.id;
      
      if (!isAdmin && !isAuthor) {
        throw new Error('Not authorized to delete this post');
      }
      
      // Delete the post
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (deleteError) {
        // Try once more with fresh headers if we have an auth issue
        if (deleteError.code === '42501' || deleteError.code === '401') {
          await authService.refreshAuthenticationStatus();
          
          const { error: retryError } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);
            
          if (retryError) throw retryError;
        } else {
          throw deleteError;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },
  
  // Delete a comment (admin or author only)
  async deleteComment(commentId: string | number) {
    // Check if user is authenticated
    const user = await authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      const supabase = authService.getClient();
      
      // First check if user is the author or an admin
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('user_id')
        .eq('id', commentId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      const isAdmin = roleData?.role === 'admin';
      const isAuthor = comment.user_id === user.id;
      
      if (!isAdmin && !isAuthor) {
        throw new Error('Not authorized to delete this comment');
      }
      
      // Delete the comment
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (deleteError) {
        // Try once more with fresh headers if we have an auth issue
        if (deleteError.code === '42501' || deleteError.code === '401') {
          await authService.refreshAuthenticationStatus();
          
          const { error: retryError } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);
            
          if (retryError) throw retryError;
        } else {
          throw deleteError;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },
  
  // Update a post (e.g., toggle pin status)
  async updatePost(postId: string | number, updates: { [key: string]: any }) {
    // Check if user is authenticated
    const user = await authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      const supabase = authService.getClient();
      
      // First check if user is the author or an admin
      const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      const isAdmin = roleData?.role === 'admin';
      const isModerator = roleData?.role === 'moderator';
      const isAuthor = post.user_id === user.id;
      
      // Different permissions for different update types
      if (updates.is_pinned !== undefined && !isAdmin && !isModerator) {
        throw new Error('Only admins and moderators can pin/unpin posts');
      }
      
      if (!isAdmin && !isModerator && !isAuthor) {
        throw new Error('Not authorized to update this post');
      }
      
      // Update the post
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId)
        .select();
      
      if (error) {
        // Try once more with fresh headers if we have an auth issue
        if (error.code === '42501' || error.code === '401') {
          await authService.refreshAuthenticationStatus();
          
          const { data: retryData, error: retryError } = await supabase
            .from('posts')
            .update(updates)
            .eq('id', postId)
            .select();
            
          if (retryError) throw retryError;
          return retryData;
        }
        
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },
  
  // Debug authentication
  async debugAuth() {
    try {
      const supabase = authService.getClient();
      const { data, error } = await supabase.rpc('debug_auth');
      
      if (error) {
        console.error("Error debugging auth:", error);
        return null;
      }
      
      console.log("Authentication Debug:", data);
      return data;
    } catch (error) {
      console.error("Error debugging auth:", error);
      return null;
    }
  }
};