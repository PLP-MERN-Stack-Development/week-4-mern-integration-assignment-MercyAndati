// src/pages/CategoriesPage.jsx
import { useState, useEffect } from 'react';
import { categoryService } from '../services/api';
import useApi from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

const CategoriesPage = () => {
  const { user } = useAuth();
  const [newCategory, setNewCategory] = useState('');
  const { 
    data: categoriesData, 
    error, 
    loading, 
    request: fetchCategories 
  } = useApi(categoryService.getAllCategories);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      await categoryService.createCategory({ name: newCategory });
      setNewCategory('');
      fetchCategories(); // Refresh the list
    } catch (err) {
      console.error('Failed to create category:', err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={fetchCategories} />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Categories</h1>
      
      {user?.role === 'admin' && (
        <form onSubmit={handleAddCategory} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New category name"
              className="flex-grow p-2 border rounded"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button 
              type="submit" 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Category
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriesData?.data?.map((category) => (
          <div key={category._id} className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
            <p className="text-gray-600">{category.description || 'No description'}</p>
            <div className="mt-2 text-sm text-gray-500">
              Slug: {category.slug}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;