import authRoutes from "./authRoutes.js";
import propertyRoutes from "./propertyRoutes.js";
import express from "express";

//================================================

const router = express.Router();

//================================================

router.use("/auth", authRoutes);
router.use("/properties", propertyRoutes);

export default router;
