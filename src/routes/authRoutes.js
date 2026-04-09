import express from "express";
import {
  register,
  verifyAccount,
} from "../controllers/authController.js";

//================================================

const router = express.Router();

//================================================

router.post("/register", register);
router.post("/verify", verifyAccount);

export default router;
