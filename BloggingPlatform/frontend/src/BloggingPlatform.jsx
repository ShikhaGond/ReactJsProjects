// Frontend/src/BloggingPlatform.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

// API configuration
const API_URL = 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_URL
});

// Add auth token to requests
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Main App Component
const BloggingPlatform = () => {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check for stored token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setAuthToken(token);
      setCurrentUser(JSON.parse(storedUser));
    }
    
    fetchPosts();
  }, []);
  
  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/posts');
      setPosts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Auth functions
  const login = async (username, password) => {
    try {
      const response = await api.post('/login', { username, password });
      const { token, user } = response.data;
      
      setAuthToken(token);
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };
  
  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem('user');
  };
  
  const register = async (username, password) => {
    try {
      const response = await api.post('/register', { username, password });
      const { token, user } = response.data;
      
      setAuthToken(token);
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };
  
  // Post functions
  const createPost = async (title, content) => {
    try {
      const response = await api.post('/posts', { title, content });
      setPosts([response.data, ...posts]);
      return { success: true, post: response.data };
    } catch (err) {
      console.error('Error creating post:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to create post. Please try again.' 
      };
    }
  };
  
  const editPost = async (id, title, content) => {
    try {
      const response = await api.put(`/posts/${id}`, { title, content });
      const updatedPosts = posts.map(post => 
        post._id === id ? response.data : post
      );
      setPosts(updatedPosts);
      return { success: true, post: response.data };
    } catch (err) {
      console.error('Error updating post:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to update post. Please try again.' 
      };
    }
  };
  
  const deletePost = async (id) => {
    try {
      await api.delete(`/posts/${id}`);
      setPosts(posts.filter(post => post._id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting post:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to delete post. Please try again.' 
      };
    }
  };
  
  // Comment functions
  const addComment = async (postId, text) => {
    try {
      const response = await api.post(`/posts/${postId}/comments`, { text });
      const updatedPosts = posts.map(post => 
        post._id === postId ? response.data : post
      );
      setPosts(updatedPosts);
      return { success: true };
    } catch (err) {
      console.error('Error adding comment:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to add comment. Please try again.' 
      };
    }
  };
  
  // Components
  const Navbar = () => (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">BlogMark</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/">Home</Link>
        {currentUser && <Link to="/create">New Post</Link>}
        {!currentUser && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        {currentUser && (
          <button onClick={logout} className="logout-btn">Logout ({currentUser.username})</button>
        )}
      </div>
    </nav>
  );
  
  const HomePage = () => (
    <div className="home-container">
      <h1>Recent Posts</h1>
      
      {loading && <div className="loading">Loading posts...</div>}
      
      {error && <div className="error-message">{error}</div>}
      
      {!loading && posts.length === 0 && (
        <div className="empty-state">
          <p>No posts yet. Be the first to create a post!</p>
          {currentUser && (
            <Link to="/create" className="button">Create Post</Link>
          )}
        </div>
      )}
      
      {posts.map(post => (
        <div key={post._id} className="post-card">
          <h2><Link to={`/post/${post._id}`}>{post.title}</Link></h2>
          <div className="post-meta">
            <span>By {post.author}</span>
            <span>{new Date(post.date).toLocaleDateString()}</span>
          </div>
          <div className="post-preview">
            <ReactMarkdown>{post.content.substring(0, 150)}...</ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
  
  const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [loadingPost, setLoadingPost] = useState(true);
    const [postError, setPostError] = useState(null);
    
    useEffect(() => {
      const fetchPost = async () => {
        try {
          setLoadingPost(true);
          const response = await api.get(`/posts/${id}`);
          setPost(response.data);
          setEditTitle(response.data.title);
          setEditContent(response.data.content);
          setPostError(null);
        } catch (err) {
          console.error('Error fetching post:', err);
          setPostError('Failed to load post. It may have been removed or you may not have permission to view it.');
        } finally {
          setLoadingPost(false);
        }
      };
      
      fetchPost();
    }, [id]);
    
    const handleCommentSubmit = async (e) => {
      e.preventDefault();
      if (commentText.trim()) {
        const result = await addComment(post._id, commentText);
        if (result.success) {
          setCommentText('');
          // Update the post with the new comment
          const updatedPost = posts.find(p => p._id === post._id);
          if (updatedPost) {
            setPost(updatedPost);
          }
        } else {
          alert(result.message);
        }
      }
    };
    
    const handleEditSave = async () => {
      if (editTitle.trim() && editContent.trim()) {
        const result = await editPost(post._id, editTitle, editContent);
        if (result.success) {
          setPost(result.post);
          setEditMode(false);
        } else {
          alert(result.message);
        }
      }
    };
    
    const handleDeletePost = async () => {
      if (window.confirm('Are you sure you want to delete this post?')) {
        const result = await deletePost(post._id);
        if (result.success) {
          navigate('/');
        } else {
          alert(result.message);
        }
      }
    };
    
    if (loadingPost) return <div className="loading">Loading post...</div>;
    if (postError) return <div className="error-message">{postError}</div>;
    if (!post) return <div className="error-message">Post not found</div>;
    
    const canEdit = currentUser && (currentUser.username === post.author || currentUser.isAdmin);
    
    return (
      <div className="post-detail">
        {!editMode ? (
          <>
            <h1>{post.title}</h1>
            <div className="post-meta">
              <span>By {post.author}</span>
              <span>{new Date(post.date).toLocaleDateString()}</span>
            </div>
            <div className="post-content">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
            {canEdit && (
              <div className="post-actions">
                <button onClick={() => setEditMode(true)}>Edit</button>
                <button onClick={handleDeletePost}>Delete</button>
              </div>
            )}
          </>
        ) : (
          <div className="edit-post-form">
            <h2>Edit Post</h2>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Post Title"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Write your post content (Markdown supported)"
              rows="10"
            />
            <div className="form-actions">
              <button onClick={handleEditSave}>Save</button>
              <button onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          </div>
        )}
        
        <div className="comments-section">
          <h3>Comments ({post.comments.length})</h3>
          {currentUser ? (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                rows="3"
              />
              <button type="submit">Post Comment</button>
            </form>
          ) : (
            <p><Link to="/login">Login</Link> to comment</p>
          )}
          
          <div className="comments-list">
            {post.comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            ) : (
              post.comments.map((comment, index) => (
                <div key={index} className="comment">
                  <div className="comment-meta">
                    <span>{comment.author}</span>
                    <span>{new Date(comment.date).toLocaleDateString()}</span>
                  </div>
                  <p>{comment.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const CreatePost = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!title.trim() || !content.trim()) {
        setFormError('Title and content are required');
        return;
      }
      
      setSubmitting(true);
      const result = await createPost(title, content);
      setSubmitting(false);
      
      if (result.success) {
        navigate(`/post/${result.post._id}`);
      } else {
        setFormError(result.message);
      }
    };
    
    if (!currentUser) return <Navigate to="/login" />;
    
    return (
      <div className="create-post">
        <h1>Create New Post</h1>
        {formError && <div className="error-message">{formError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post Title"
              required
            />
          </div>
          <div className="form-group">
            <label>Content (Markdown supported)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content using Markdown..."
              rows="10"
              required
            />
          </div>
          <div className="preview">
            <h3>Preview</h3>
            <div className="markdown-preview">
              <h2>{title || 'Post Title'}</h2>
              <ReactMarkdown>{content || 'Post content will appear here...'}</ReactMarkdown>
            </div>
          </div>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Publishing...' : 'Publish Post'}
          </button>
        </form>
      </div>
    );
  };
  
  const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!username || !password) {
        setError('Please enter both username and password');
        return;
      }
      
      setIsLoggingIn(true);
      const result = await login(username, password);
      setIsLoggingIn(false);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    };
    
    if (currentUser) return <Navigate to="/" />;
    
    return (
      <div className="auth-form">
        <h1>Login</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    );
  };
  
  const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!username || !password) {
        setError('Please enter both username and password');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      setIsRegistering(true);
      const result = await register(username, password);
      setIsRegistering(false);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    };
    
    if (currentUser) return <Navigate to="/" />;
    
    return (
      <div className="auth-form">
        <h1>Register</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={isRegistering}>
            {isRegistering ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    );
  };
  
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
        <footer>
          <p>&copy; 2025 BlogMark - A React Markdown Blogging Platform</p>
        </footer>
      </div>
    </Router>
  );
};

export default BloggingPlatform;