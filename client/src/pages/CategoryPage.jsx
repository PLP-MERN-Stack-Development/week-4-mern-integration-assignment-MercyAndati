"use client"
import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { categoryService, postService } from "../services/api"
import useApi from "../hooks/useApi"
import { useAuth } from "../context/AuthContext"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorDisplay from "../components/ErrorDisplay"
import { toast } from "react-toastify"

const CategoryPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [filteredPosts, setFilteredPosts] = useState([])
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    data: category,
    error: categoryError,
    loading: categoryLoading,
    request: fetchCategory,
  } = useApi(categoryService.getCategory)

  const {
    data: allPostsData,
    error: allPostsError,
    loading: allPostsLoading,
    request: fetchAllPosts,
  } = useApi(postService.getAllPosts)

  useEffect(() => {
    if (id) {
      fetchCategory(id)
      fetchAllPosts() // Get all posts, we'll filter on frontend
    }
  }, [id])

  useEffect(() => {
    if (category) {
      setEditName(category.name)
      setEditDescription(category.slug || "")
    }
  }, [category])

  // Filter posts when allPostsData, id, or user changes
  useEffect(() => {
    if (allPostsData && id) {
      console.log("All posts:", allPostsData)
      console.log("Looking for category ID:", id)
      console.log("Current user:", user)

      // Filter posts that belong to this category
      const categoryPosts = allPostsData.filter((post) => {
        // Handle different possible formats of category data
        const postCategoryId =
          post.category?._id || // If category is populated object
          post.category || // If category is just the ID
          null

        // Compare both as strings to handle ObjectId vs string comparison
        return postCategoryId && postCategoryId.toString() === id.toString()
      })

      // Apply publication status filtering based on user permissions
      const visiblePosts = categoryPosts.filter((post) => {
        // If post is published, everyone can see it
        if (post.isPublished) return true

        // If post is unpublished, only show to author or admin
        if (!post.isPublished) {
          // Check if user is the author
          const isAuthor = user && (post.author?._id === user.id || post.author?._id === user._id)
          // Check if user is admin
          const isAdmin = user && user.role === "admin"

          return isAuthor || isAdmin
        }

        return false
      })

      console.log(`Found ${categoryPosts.length} posts in category, ${visiblePosts.length} visible to current user`)
      setFilteredPosts(visiblePosts)
    } else {
      setFilteredPosts([])
    }
  }, [allPostsData, id, user])

  const handleUpdateCategory = async (e) => {
    e.preventDefault()
    if (!editName.trim()) return

    try {
      await categoryService.updateCategory(id, {
        name: editName,
        slug: editDescription,
      })
      toast.success("Category updated successfully")
      setIsEditing(false)
      fetchCategory(id)
    } catch (err) {
      toast.error("Failed to update category")
      console.error("Failed to update category:", err)
    }
  }

  const handleDeleteCategory = async () => {
    // Check if category has posts first (frontend validation)
    if (filteredPosts.length > 0) {
      toast.error(
        `Cannot delete category "${category.name}" because it has ${filteredPosts.length} post(s). Please move or delete all posts in this category first.`,
      )
      return
    }

    if (
      !window.confirm(`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`)
    ) {
      return
    }

    setIsDeleting(true)

    try {
      console.log("Attempting to delete category with ID:", id)
      await categoryService.deleteCategory(id)
      toast.success("Category deleted successfully")
      navigate("/categories")
    } catch (err) {
      console.error("Delete error details:", {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
      })

      let errorMessage = "Failed to delete category"

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.response?.status === 500) {
        errorMessage = "Server error occurred while deleting category. Please try again."
      } else if (err.response?.status === 404) {
        errorMessage = "Category not found"
      } else if (err.response?.status === 401) {
        errorMessage = "You are not authorized to delete this category"
      }

      // Check if it's the specific error about posts existing
      if (errorMessage.includes("associated posts") || errorMessage.includes("posts first")) {
        toast.error(
          "Cannot delete category with existing posts. Please move or delete all posts in this category first.",
        )
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  // Helper function to check if user can edit a post
  const canEditPost = (post) => {
    if (!user) return false
    const isAuthor = post.author?._id === user.id || post.author?._id === user._id
    const isAdmin = user.role === "admin"
    return isAuthor || isAdmin
  }

  if (categoryLoading) return <LoadingSpinner />
  if (categoryError) return <ErrorDisplay error={categoryError} onRetry={() => fetchCategory(id)} />
  if (!category) return <div>Category not found</div>

  // Use allPostsLoading and allPostsError for posts section
  const postsLoadingState = allPostsLoading
  const postsErrorState = allPostsError

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 dark:bg-gray-950 dark:text-gray-300">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            {isEditing ? (
              <form onSubmit={handleUpdateCategory} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-3xl font-bold bg-transparent border-b-2 border-gray-300 focus:border-indigo-500 outline-none"
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="text-gray-600 dark:text-gray-400 bg-transparent border-b border-gray-300 focus:border-indigo-500 outline-none"
                    placeholder="Description"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
                <p className="text-gray-600 dark:text-gray-400">{category.slug || "No description"}</p>
              </>
            )}
          </div>

          {user?.role === "admin" && !isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={isDeleting}
              >
                Edit
              </button>
              <button
                onClick={handleDeleteCategory}
                disabled={isDeleting}
                className={`px-4 py-2 rounded text-white ${
                  isDeleting
                    ? "bg-gray-400 cursor-not-allowed"
                    : filteredPosts.length > 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                }`}
                title={
                  filteredPosts.length > 0
                    ? `Cannot delete - category has ${filteredPosts.length} post(s)`
                    : "Delete category"
                }
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>

        <Link to="/categories" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
          ← Back to Categories
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6">
          Posts in this category ({filteredPosts.length})
        </h2>

        {postsLoadingState ? (
          <LoadingSpinner />
        ) : postsErrorState ? (
          <ErrorDisplay error={postsErrorState} onRetry={() => fetchAllPosts()} />
        ) : filteredPosts && filteredPosts.length > 0 ? (
          <div className="grid gap-6">
            {filteredPosts.map((post) => (
              <div
                key={post._id}
                className={`border rounded-lg p-6 shadow hover:shadow-md transition-shadow ${
                  !post.isPublished ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Link to={`/posts/${post._id}`} className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 hover:text-indigo-600">{post.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {post.excerpt || post.content?.substring(0, 150) + "..."}
                    </p>
                  </Link>

                  {/* Edit/Delete buttons for post author or admin */}
                  {canEditPost(post) && (
                    <div className="flex gap-2 ml-4">
                      <Link
                        to={`/edit-post/${post._id}`}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        Edit
                      </Link>
                    </div>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 flex-wrap gap-2">
                  <span>By {post.author?.username || "Unknown"}</span>
                  <span>•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{post.viewCount || 0} views</span>

                  {/* Publication Status Badge */}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      post.isPublished
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {post.isPublished ? "Published" : "Draft"}
                  </span>

                  {/* Category Badge */}
                  {post.category?.name && (
                    <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">{post.category.name}</span>
                  )}

                  {/* Only visible to author/admin indicator */}
                  {!post.isPublished && (
                    <span className="text-yellow-600 dark:text-yellow-400 text-xs italic">(Only visible to you)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-6">No posts found in this category yet.</p>
            <div className="flex gap-4 justify-center">
              <Link to="/" className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700">
                Go to Homepage
              </Link>
              {user && (
                <Link to="/create-post" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
                  Create Post
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryPage
