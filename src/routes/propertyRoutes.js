import express from "express";
import {
  getAllProperties,
  getRecommendedProperties,
  getPopularProperties,
  getNearbyProperties,
  getPropertyById,
  addProperty,
} from "../controllers/propertyController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// GET requests
router.get("/", getAllProperties);
router.get("/recommended", getRecommendedProperties);
router.get("/popular", getPopularProperties);
router.get("/nearby", getNearbyProperties);
router.get("/:id", getPropertyById);

// POST requests
router.post("/", addProperty);

export default router;
