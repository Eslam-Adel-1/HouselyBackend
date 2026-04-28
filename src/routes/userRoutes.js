import express from "express";
import {
  getUserLocation,
  updateProfile,
  updateProfileImage,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

//================================================

const router = express.Router();

//================================================

router.use(protect);

router.post("/location", getUserLocation);
router.patch("/profile", updateProfile);
router.patch(
  "/profile/image",
  upload.single("profileImage"),
  updateProfileImage,
);

export default router;
