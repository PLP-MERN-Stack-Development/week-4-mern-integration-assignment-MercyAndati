import { createContext, useContext, useState } from 'react';
import { postService } from '../services/api';

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const { data } = await postService.getAllPosts();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await postService.getAllCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <PostContext.Provider value={{ 
      posts, 
      categories, 
      isLoading, 
      error, 
      fetchPosts, 
      fetchCategories 
    }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => useContext(PostContext);