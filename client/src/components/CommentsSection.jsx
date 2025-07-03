import { useAuth } from '../context/AuthContext';

const CommentsSection = ({ comments, commentContent, setCommentContent, handleAddComment }) => {
  const { user } = useAuth();

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Comments ({comments?.length || 0})</h2>
      
      {user ? (
        <form onSubmit={handleAddComment} className="mb-8">
          <div className="mb-2">
            <label className="block text-gray-700 mb-2">Add Comment</label>
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="w-full p-2 border rounded min-h-[100px]"
              placeholder="Write your comment here..."
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Post Comment
          </button>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-100 rounded">
          <p>
            Please <a href="/login" className="text-blue-500">login</a> to post a comment.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {comments?.map((comment) => (
          <div key={comment._id || comment.createdAt} className="border-b pb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">
                {comment.user?.username || 'Anonymous'}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-800">{comment.content}</p>
          </div>
        ))}
        
        {comments?.length === 0 && (
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </section>
  );
};

export default CommentsSection;