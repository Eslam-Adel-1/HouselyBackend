import authRoutes from "./authRoutes.js";
import propertyRoutes from "./propertyRoutes.js";
import chatRoutes from "./chatRoutes.js";
import userRoutes from "./userRoutes.js";
import express from "express";

//================================================

const router = express.Router();

//================================================

router.use("/auth", authRoutes);
router.use("/properties", propertyRoutes);
router.use("/chat", chatRoutes);
router.use("/user", userRoutes);

export default router;
