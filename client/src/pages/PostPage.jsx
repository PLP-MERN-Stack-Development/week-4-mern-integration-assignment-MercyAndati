"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { postService } from "../services/api"
import useApi from "../hooks/useApi"
import { useAuth } from "../context/AuthContext"
import CommentsSection from "../components/CommentsSection"

const PostPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [commentContent, setCommentContent] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { data: post, error, loading, request } = useApi(postService.getPost)

  // Use ref to track if view has been counted to prevent double counting
  const viewCounted = useRef(false)

  useEffect(() => {
    if (id && !viewCounted.current) {
      console.log("Making API request with ID:", id)
      request(id)
      viewCounted.current = true // Mark as counted
    }
  }, [id])

  console.log("Post ID from params:", id)

  const handleAddComment = async (e) => {
    e.preventDefault()
    try {
      await postService.addComment(post._id, { content: commentContent })
      await request(id)
      setCommentContent("")
    } catch (err) {
      console.error("Failed to add comment:", err)
    }
  }

  const handleDeletePost = async () => {
    try {
      await postService.deletePost(post._id)
      navigate("/") // Redirect to homepage after deletion
    } catch (err) {
      console.error("Failed to delete post:", err)
      alert("Failed to delete post. Please try again.")
    }
  }

  const handleEditClick = () => {
    navigate(`/edit-post/${post._id}`)
  }

  // Check if current user can edit/delete this post
  const canEditPost =
    user && post && (user.id === post.author?._id || user._id === post.author?._id || user.role === "admin")

  if (!id) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error: Missing post ID</p>
        <Link to="/" className="text-blue-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
    )
  }

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (error)
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error: {error}</p>
        <Link to="/" className="text-blue-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
    )
  if (!post)
    return (
      <div className="text-center py-8">
        <p>Post not found</p>
        <Link to="/" className="text-blue-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
    )

  // Fix image URL construction for post page
  const baseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "")
    : "http://localhost:5000"

  const cleanImagePath = post.featuredImage ? post.featuredImage.replace(/\\/g, "/") : null
  const imageUrl = `${baseUrl}/uploads/${cleanImagePath}`

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 dark:text-gray-300">
      {/* Back to Home Link */}
      <Link to="/" className="text-indigo-500 hover:underline mb-4 inline-block">
        ← Back to Home
      </Link>

      <article className="mb-8">
        {post.featuredImage && post.featuredImage !== "default-post.jpg" ? (
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={post.title}
            className="h-64 object-contain mb-6 rounded-xl"
            onLoad={() => console.log("Post page image loaded:", imageUrl)}
            onError={(e) => {
              console.error("Post page image failed to load:", imageUrl)
              e.target.onerror = null
              e.target.style.display = "none"
            }}
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center mb-6 rounded-lg">
            <span className="text-gray-500">No image available</span>
          </div>
        )}

        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{post.title}</h1>

          {/* Edit/Delete buttons for post author or admin */}
          {canEditPost && (
            <div className="flex gap-2 ml-4">
              <button
                onClick={handleEditClick}
                className="bg-blue-500 text-white px-3 py-1 rounded-xl text-sm hover:bg-blue-600 transition-colors dark:bg-blue-950"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-purple-600 text-white px-3 py-1 rounded-xl text-sm  hover:bg-red-600 transition-colors dark:bg-indigo-950"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mb-6 text-gray-600">
          <span>By {post.author?.username || "Unknown"}</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          <span>{post.viewCount || 0} views</span>
          {post.category && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {post.category.name}
            </span>
          )}

          {post.tags && (
            Array.isArray(post.tags)
              ? post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm dark:bg-fuchsia-200 dark:text-fuchsia-700 "
                  >
                    {tag}
                  </span>
                ))
              : (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    {post.tags}
                  </span>
                )
          )}
        </div>

        <div className="prose max-w-none mb-8">
          <div className="whitespace-pre-wrap">{post.content}</div>
        </div>
      </article>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 ">
          <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs w-full mx-4 dark:bg-gray-950">
            <p className="text-gray-700 mb-4">Are you sure you want to delete this post?</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 text-gray-600 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeletePost}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <CommentsSection
        comments={post.comments || []}
        commentContent={commentContent}
        setCommentContent={setCommentContent}
        handleAddComment={handleAddComment}
      />
    </div>
  )
}

export default PostPage
