"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { postService } from "../services/api"
import useApi from "../hooks/useApi"
import { useAuth } from "../context/AuthContext"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorDisplay from "../components/ErrorDisplay"
import { toast } from "react-toastify"

const MyPostsPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [filter, setFilter] = useState("all") 
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  const { data: allPosts, error, loading, request: fetchPosts } = useApi(postService.getAllPosts)

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }
    fetchPosts()
  }, [user])

  // Filter posts by current user and publication status
  const filteredPosts = allPosts
    ? allPosts.filter((post) => {
        // First filter by author
        const isMyPost = post.author?._id === user?.id || post.author?._id === user?._id

        if (!isMyPost) return false

        // Then filter by publication status
        if (filter === "published") return post.isPublished === true
        if (filter === "draft") return post.isPublished === false
        return true // 'all'
      })
    : []

  const handleDeletePost = async (postId) => {
    try {
      await postService.deletePost(postId)
      toast.success("Post deleted successfully")
      fetchPosts() // Refresh the list
      setShowDeleteConfirm(null)
    } catch (err) {
      console.error("Failed to delete post:", err)
      toast.error("Failed to delete post. Please try again.")
    }
  }

  const handleEditClick = (postId) => {
    navigate(`/edit-post/${postId}`)
  }

  // Fix image URL construction
  const getImageUrl = (featuredImage) => {
    if (!featuredImage || featuredImage === "default-post.jpg") return null
    const baseUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace("/api", "")
      : "http://localhost:5000"
    const cleanImagePath = featuredImage.replace(/\\/g, "/")
    return `${baseUrl}/uploads/${cleanImagePath}`
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p>Please log in to view your posts.</p>
        <Link to="/login" className="text-indigo-600 hover:underline">
          Go to Login
        </Link>
      </div>
    )
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} onRetry={fetchPosts} />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 dark:bg-gray-950 dark:text-gray-300">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Posts</h1>
        <Link to="/create-post" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Create New Post
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          All ({allPosts ? allPosts.filter((p) => p.author?._id === user?.id || p.author?._id === user?._id).length : 0}
          )
        </button>
        <button
          onClick={() => setFilter("published")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === "published"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Published (
          {allPosts
            ? allPosts.filter((p) => (p.author?._id === user?.id || p.author?._id === user?._id) && p.isPublished)
                .length
            : 0}
          )
        </button>
        <button
          onClick={() => setFilter("draft")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === "draft"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Drafts (
          {allPosts
            ? allPosts.filter((p) => (p.author?._id === user?.id || p.author?._id === user?._id) && !p.isPublished)
                .length
            : 0}
          )
        </button>
      </div>

      {filteredPosts.length > 0 ? (
        <div className="grid gap-6">
          {filteredPosts.map((post) => (
            <div key={post._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="flex">
                {/* Image */}
                <div className="w-48 h-32 flex-shrink-0">
                  {getImageUrl(post.featuredImage) ? (
                    <img
                      src={getImageUrl(post.featuredImage) || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No image</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <Link to={`/posts/${post._id}`} className="block">
                        <h3 className="text-xl font-semibold mb-2 hover:text-indigo-600 dark:hover:text-indigo-400">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {post.excerpt || post.content?.substring(0, 150) + "..."}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditClick(post._id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-xl text-sm hover:bg-blue-600 transition-colors dark:bg-blue-950"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(post._id)}
                        className="bg-purple-600 text-white px-3 py-1 rounded-xl text-sm  hover:bg-red-600 transition-colors dark:bg-indigo-950"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Meta Information */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>{post.viewCount || 0} views</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        post.isPublished
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {post.isPublished ? "Published" : "Draft"}
                    </span>
                    {post.category && (
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                        {post.category.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mb-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {filter === "all" && "You have no posts yet"}
            {filter === "published" && "You have no published posts"}
            {filter === "draft" && "You have no draft posts"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {filter === "all" && "Start writing your first blog post!"}
            {filter === "published" && "Publish some of your drafts or create new posts."}
            {filter === "draft" && "Create some draft posts to work on later."}
          </p>
          <Link to="/create-post" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
            Create Post
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Delete Post</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyPostsPage
