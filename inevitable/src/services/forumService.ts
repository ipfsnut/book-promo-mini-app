import { supabase } from '../lib/supabase';
import { authService } from './authService';

export const forumService = {
  // Get all posts
  async getPosts() {
    try {
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
        .order('created_at', { ascending: false });
      
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
  async createPost(title: string, content: string) {
    // Check if user is authenticated
    const user = await authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
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
      
      if (error) throw error;
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
      const { data, error } = await supabase
        .from('comments')
        .insert([
          { 
            content,
            post_id: postId,
            user_id: user.id
          }
        ])
        .select();
      
      if (error) throw error;
      return data;
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
      
      if (deleteError) throw deleteError;
      
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
      
      if (deleteError) throw deleteError;
      
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },
  
  // Add this method to the forumService object
  async updatePost(postId: string | number, updates: { [key: string]: any }) {
    // Check if user is authenticated
    const user = await authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
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
        throw new Error('Not authorized to update this post');
      }
      
      // Update the post
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId)
        .select();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }
};
