import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../services/api';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

const HomePage = () => {
  const { 
    data: postsData, 
    error, 
    loading, 
    request: fetchPosts 
  } = useApi(() => postService.getAllPosts(1, 10)); // Fixed: Properly wrapped

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error.message} onRetry={fetchPosts} />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Latest Posts</h1>
      
      {postsData?.data?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {postsData.data.map((post) => (
            <div key={post._id} className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
              <Link to={`/posts/${post.slug || post._id}`}>
                {post.featuredImage && (
                  <img 
                    src={`http://localhost:5000/uploads/${post.featuredImage}`}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                  <p className="text-gray-600 mb-2">{post.excerpt}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>{post.viewCount} views</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No posts found. Create your first post!</p>
          <Link 
            to="/create-post" 
            className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Post
          </Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;