import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService, categoryService } from '../services/api';
import useApi from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const CreatePostPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
const { data: categories, loading: categoriesLoading, error: categoriesError , request:fetchCategories} = useApi(categoryService.getAllCategories, {initialData: []});  
const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    isPublished: true,
    featuredImage: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState(null);

  console.log('Current user:', user);
console.log('User ID being sent:', user?.id);
  //for debugging
  useEffect(() => {
  console.log('Categories loading state:', categoriesLoading);
  console.log('Categories error:', categoriesError);
  console.log('Full categories response:', categories);
  
  if (categories?.data) {
    console.log('Nested data structure:', {
      success: categories.data.success,
      count: categories.data.count,
      firstCategory: categories.data.data?.[0]
    });
  }
}, [categoriesLoading, categoriesError, categories]);


useEffect(() => {
  fetchCategories(); // This will trigger the API call
}, []);// run only on mount

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    });

    if (type === 'file' && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);

  try {
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('excerpt', formData.excerpt);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('tags', formData.tags);
    formDataToSend.append('isPublished', formData.isPublished);
    formDataToSend.append('author', user.id);  // Changed from _id to id
    if (formData.featuredImage) {
      formDataToSend.append('featuredImage', formData.featuredImage);
    }

    const response = await postService.createPost(formDataToSend);
    navigate(`/posts/${response.data._id}`);
  } catch (err) {
  console.error('Full error response:', err.response);
  setError(
    err.response?.data?.message || 
    err.response?.data?.error || 
    err.message || 
    'Failed to create post'
  );
}
};

  if (!user) {
    return <div>Please login to create a post</div>;
  }

  return (
    <div className="max-w-4xl mx-auto dark:bg-gray-950 dark:text-gray-300">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full p-2 border rounded min-h-[200px]"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Excerpt</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            maxLength="200"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Category</label>
          
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:text-gray-300 dark:bg-gray-950"
            required
          >
            <option value="">Select a category</option>
            {categoriesLoading && <option value="" disabled>Loading categories...</option>}
            {categoriesError && <option value="" disabled>Error loading categories</option>}
            {Array.isArray(categories) && categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="rounded"
            />
            <span>Publish immediately</span>
          </label>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Featured Image</label>
          <input
            type="file"
            name="featuredImage"
            onChange={handleChange}
            accept="image/*"
            className="w-full p-2 border rounded"
          />
          {previewImage && (
            <div className="mt-2">
              <img 
                src={previewImage} 
                alt="Preview" 
                className="max-w-xs max-h-48 object-contain"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-cyan-600 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
        >
          Create Post
        </button>
      </form>
    </div>
  );
};

export default CreatePostPage;