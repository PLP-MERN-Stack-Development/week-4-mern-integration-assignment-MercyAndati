import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postService } from '../services/api';
import useApi from '../hooks/useApi';
import CommentsSection from '../components/CommentsSection';

const PostPage = () => {
  const { idOrSlug } = useParams();
  const { data, error, loading, request } = useApi(postService.getPost);
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => {
    request(idOrSlug);
  }, [idOrSlug]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      await postService.addComment(data._id, { content: commentContent });
      await request(idOrSlug); // Refresh post data
      setCommentContent('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <article className="mb-8">
        <img 
          src={`http://localhost:5000/uploads/${data.featuredImage}`} 
          alt={data.title}
          className="w-full h-64 object-cover mb-6 rounded-lg"
        />
        <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
        <div className="flex items-center gap-4 mb-6 text-gray-600">
          <span>By {data.author?.username}</span>
          <span>{new Date(data.createdAt).toLocaleDateString()}</span>
          <span>{data.viewCount} views</span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
            {data.category?.name}
          </span>
        </div>
        <div className="prose max-w-none">
          {data.content}
        </div>
      </article>

      <CommentsSection 
        comments={data.comments} 
        commentContent={commentContent}
        setCommentContent={setCommentContent}
        handleAddComment={handleAddComment}
      />
    </div>
  );
};

export default PostPage;