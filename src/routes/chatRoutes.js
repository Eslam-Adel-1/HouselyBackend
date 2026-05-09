import express from "express";
import {
  getConversations,
  getMessages,
  startConversation,
  uploadMedia,
} from "../controllers/chatController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Apply protection to all chat routes
router.use(protect);

// GET requests
router.get("/conversations", getConversations);
router.get("/messages/:conversationId", getMessages);

// POST requests
router.post("/conversation", startConversation);

// Media upload route
router.post("/upload", upload.single("media"), uploadMedia);

export default router;
