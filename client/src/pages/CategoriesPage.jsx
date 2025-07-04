"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { categoryService } from "../services/api"
import useApi from "../hooks/useApi"
import { useAuth } from "../context/AuthContext"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorDisplay from "../components/ErrorDisplay"

const CategoriesPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [newCategory, setNewCategory] = useState("")
  const [newDescription, setNewDescription] = useState("")

  const { data: categoriesData, error, loading, request: fetchCategories } = useApi(categoryService.getAllCategories)

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategory.trim()) return

    try {
      await categoryService.createCategory({
        name: newCategory,
        slug: newDescription, // Will use this if provided, otherwise backend will auto-generate
      })
      setNewCategory("")
      setNewDescription("")
      fetchCategories()
    } catch (err) {
      console.error("Failed to create category:", err)
    }
  }

  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}`)
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} onRetry={fetchCategories} />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 dark:bg-gray-950 dark:text-gray-300">
      <h1 className="text-3xl font-bold mb-8">Categories</h1>

      {user?.role === "admin" && (
        <form onSubmit={handleAddCategory} className="mb-8 dark:text-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New category name"
              className="flex-grow p-2 border rounded"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <input
              type="text"
              placeholder="description"
              className="flex-grow p-2 border rounded"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-green-600">
              Add Category
            </button>
          </div>
        </form>
      )}

      {categoriesData && categoriesData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesData.map((category) => (
            <div
              key={category._id}
              onClick={() => handleCategoryClick(category._id)}
              className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">{category.slug || "No description"}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No categories found</p>
      )}
    </div>
  )
}

export default CategoriesPage
