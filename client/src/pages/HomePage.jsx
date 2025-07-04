"use client"

import { useEffect } from "react"
import { Link } from "react-router-dom"
import { postService } from "../services/api"
import useApi from "../hooks/useApi"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorDisplay from "../components/ErrorDisplay"

const HomePage = () => {
  const { data: posts, error, loading, request } = useApi(postService.getAllPosts)

  useEffect(() => {
    request()
  }, [])

  // Filter to show only published posts
  const publishedPosts = posts ? posts.filter((post) => post.isPublished === true) : []

  // Fix image URL construction
  const getImageUrl = (featuredImage) => {
    if (!featuredImage || featuredImage === "default-post.jpg") return null
    const baseUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace("/api", "")
      : "http://localhost:5000"
    const cleanImagePath = featuredImage.replace(/\\/g, "/")
    return `${baseUrl}/uploads/${cleanImagePath}`
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} onRetry={request} />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 dark:bg-gray-950 dark:text-gray-300">
      <h1 className="text-3xl font-bold mb-8">Latest Posts</h1>

      {publishedPosts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {publishedPosts.map((post) => (
            <div key={post._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <Link to={`/posts/${post._id}`}>
                {getImageUrl(post.featuredImage) ? (
                  <img
                    src={getImageUrl(post.featuredImage) || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.style.display = "none"
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </Link>

              <div className="p-6">
                <Link to={`/posts/${post._id}`}>
                  <h2 className="text-xl font-semibold mb-2 hover:text-indigo-600 dark:hover:text-indigo-400">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {post.excerpt || post.content?.substring(0, 150) + "..."}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>By {post.author?.username || "Unknown"}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{post.viewCount || 0} views</span>
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
          <p className="text-gray-500 dark:text-gray-400 mb-4">No published posts available yet.</p>
          <Link to="/create-post" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
            Create the first post
          </Link>
        </div>
      )}
    </div>
  )
}

export default HomePage
