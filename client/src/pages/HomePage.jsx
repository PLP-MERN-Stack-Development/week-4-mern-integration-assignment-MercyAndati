import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../services/api';
import useApi from '../hooks/useApi';

const HomePage = () => {
  const { data, error, loading, request } = useApi(postService.getAllPosts);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    request();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      await request(1, 10, null, searchTerm);
    } else {
      await request();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search posts..."
            className="flex-grow p-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data?.map((post) => (
          <div key={post._id} className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
            <Link to={`/posts/${post.slug || post._id}`}>
              <img 
                src={`http://localhost:5000/uploads/${post.featuredImage}`} 
                alt={post.title}
                className="w-full h-48 object-cover"
              />
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
    </div>
  );
};

export default HomePage;