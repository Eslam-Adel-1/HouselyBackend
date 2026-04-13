import express from "express";
import {
  login,
  register,
  verifyAccount,
  forgotPassword,
  resetPassword,
  verifyResetCode,
  resendCode,
} from "../controllers/authController.js";

//================================================

const router = express.Router();

//================================================

router.post("/register", register);
router.post("/login", login);
router.post("/verify", verifyAccount);
router.post("/verify-reset", verifyResetCode);
router.post("/resend-code", resendCode);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
