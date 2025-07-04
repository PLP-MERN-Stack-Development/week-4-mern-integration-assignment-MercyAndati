"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { postService, categoryService } from "../services/api"
import useApi from "../hooks/useApi"
import { useAuth } from "../context/AuthContext"

const EditPostPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Fix categories fetching to match CreatePostPage pattern
  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
    request: fetchCategories,
  } = useApi(categoryService.getAllCategories, { initialData: [] })

  const { data: postData, request: fetchPost } = useApi(postService.getPost)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: '',
    isPublished: true,
    featuredImage: null,
  })
  const [previewImage, setPreviewImage] = useState(null)
  const [error, setError] = useState(null)

  // Fetch categories on mount (matching CreatePostPage)
  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchPost(id)
  }, [id])

  useEffect(() => {
    if (postData) {
      setFormData({
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        category: postData.category?._id || "",
        tags: postData.tags?.join(", ") || "",
        isPublished: postData.isPublished,
        featuredImage: null,
      })
      if (postData.featuredImage) {
        const baseUrl = import.meta.env.VITE_API_URL
          ? import.meta.env.VITE_API_URL.replace("/api", "")
          : "http://localhost:5000"
        setPreviewImage(`${baseUrl}/uploads/${postData.featuredImage}`)
      }
    }
  }, [postData])

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    })
    if (type === "file" && files[0]) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("content", formData.content)
      formDataToSend.append("excerpt", formData.excerpt)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("tags", formData.tags)
      formDataToSend.append("isPublished", formData.isPublished)
      if (formData.featuredImage) {
        formDataToSend.append("featuredImage", formData.featuredImage)
      }
      await postService.updatePost(id, formDataToSend)
      navigate(`/posts/${id}`)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || "Failed to update post")
    }
  }

  if (!postData) return <div className="text-center py-8">Loading...</div>

  const canEdit =
    user && postData && (user.id === postData.author?._id || user._id === postData.author?._id || user.role === "admin")

  if (!user || !canEdit) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>You are not authorized to edit this post</p>
        <button onClick={() => navigate(`/posts/${id}`)} className="text-blue-500 hover:underline mt-4">
          ← Back to Post
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 dark:text-gray-300">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Post</h1>
        <button
          onClick={() => navigate(`/posts/${id}`)}
          className="text-gray-800 hover:text-gray-600 dark:text-gray-400 px-3 py-1 border rounded-xl"
        >
          Cancel
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full p-2 border rounded min-h-[200px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Excerpt</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength="200"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select a category</option>
            {categoriesLoading && (
              <option value="" disabled>
                Loading categories...
              </option>
            )}
            {categoriesError && (
              <option value="" disabled>
                Error loading categories
              </option>
            )}
            {Array.isArray(categories) &&
              categories.map((category) => (
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
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {previewImage && (
            <div className="mt-2">
              <img
                src={previewImage || "/placeholder.svg"}
                alt="Preview"
                className="max-w-xs max-h-48 object-contain rounded"
              />
              {formData.featuredImage === null && (
                <p className="text-sm text-gray-500 mt-1">Current image will be kept if no new image is selected</p>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 dark:bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Update Post
          </button>
          <button
            type="button"
            onClick={() => navigate(`/posts/${id}`)}
            className="bg-purple-500 dark:bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditPostPage
