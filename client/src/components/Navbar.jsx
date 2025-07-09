"use client"

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"
import { useTheme } from "../context/ThemeContext"

const Navbar = () => {
  const { user, logout, isLoading } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const { darkMode, setDarkMode } = useTheme()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="bg-gray-800 text-white dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center ">
        <Link to="/" className="md:text-2xl font-bold text-base">
          MERN Blog
        </Link>
        <nav className="grid grid-cols-2  md:flex items-center md:space-x-6 space-x-2 text-sm md:text-base lg:text-lg xl:text-xl ">
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>
          <Link to="/create-post">Create Post</Link>
          <Link to="/categories" className="hover:text-gray-300">
            Categories
          </Link>
          <button variant="secondary" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-gray-600 animate-pulse"></div>
          ) : user ? (
            <div className="relative">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowDropdown(!showDropdown)}>
                <span>{user.username}</span>
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2">
                    <p className="text-sm">{user.email}</p>
                  </div>
                  <Link
                    to="/my-posts"
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-600"
                    onClick={() => setShowDropdown(false)}
                  >
                    My Posts
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-600">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hover:text-gray-300">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
