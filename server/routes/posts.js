const express = require("express")
const router = express.Router()
const { getPosts, getPost, createPost, updatePost, deletePost, addComment } = require("../controllers/posts")
const { protect } = require("../middleware/auth")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer with diskStorage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

// Add file filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed!"), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

router.route("/").get(getPosts).post(protect, upload.single("featuredImage"), createPost)

router.route("/:id").get(getPost).put(protect, updatePost).delete(protect, deletePost)

// Add the comment route
router.route("/:id/comments").post(protect, addComment)

module.exports = router
