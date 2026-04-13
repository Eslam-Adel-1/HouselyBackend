import User from "../models/userModel.js";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import { generateToken } from "../utils/jwtUtils.js";
import { sendVerificationEmail } from "../utils/emailUtils.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../ValidationSchemas/authSchemas.js";

//================================================

// register api

export const register = async (req, res) => {
  try {
    // Validate request
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { name, email, phone, password, profession } = req.body;

    // Check if user exists (email or phone)
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      const conflictField =
        existingUser.email === email ? "Email" : "Phone number";
      return res.status(409).json({
        success: false,
        message: `${conflictField} is already in use`,
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      profession,
      verificationCode,
      verificationCodeExpire,
    });

    // Send Email
    await sendVerificationEmail(email, verificationCode, name);

    // Remove password from response
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      data: userObj,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//================================================

// login api

export const login = async (req, res) => {
  try {
    // Validate request
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { identifier, password } = req.body;

    // Find user by email OR phone
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Compare password using bcrypt
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Check verification
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Account not verified. Please check your email for the verification code.",
      });
    }

    // Remove password from response
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      data: userObj,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//================================================

export const verifyAccount = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and verification code",
      });
    }

    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Account verified successfully! You can now log in.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// verify reset code
export const verifyResetCode = async (req, res) => {
  try {
    const { identifier, code } = req.body;

    if (!identifier || !code) {
      return res.status(400).json({
        success: false,
        message: "Please provide identifier and verification code",
      });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
      resetPasswordCode: code,
      resetPasswordCodeExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    res.status(200).json({
      success: true,
      message: "Code verified successfully! You can now reset your password.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//================================================

// forgot password api
export const forgotPassword = async (req, res) => {
  try {
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { identifier } = req.body;
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with that email or phone number",
      });
    }

    // Generate reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordCodeExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    // Send via email if identifier is email (or if user has email)
    if (user.email === identifier || (!user.phone && user.email)) {
      await sendVerificationEmail(user.email, resetCode, user.name);
      return res
        .status(200)
        .json({ success: true, message: "Reset code sent to your email" });
    } else {
      // Here you would integrate SMS gateway for phone
      console.log(`[SIMULATED SMS] Reset Code for ${user.phone}: ${resetCode}`);
      return res.status(200).json({
        success: true,
        message: "Reset code sent to your phone number (Simulated)",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//================================================

// reset password api
export const resetPassword = async (req, res) => {
  try {
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { identifier, code, newPassword } = req.body;
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
      resetPasswordCode: code,
      resetPasswordCodeExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset code" });
    }

    // Update password
    user.password = await hashPassword(newPassword);
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpire = undefined;

    // Also verify account if it wasn't
    if (!user.isVerified) user.isVerified = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now log in.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// resend code api
export const resendCode = async (req, res) => {
  try {
    const { identifier, mode } = req.body; // mode: 'register' or 'reset'

    if (!identifier || !mode) {
      return res.status(400).json({
        success: false,
        message: "Please provide identifier and mode",
      });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate new code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expireTime = Date.now() + 10 * 60 * 1000; // 10 mins

    if (mode === "register") {
      user.verificationCode = newCode;
      user.verificationCodeExpire = expireTime;
    } else if (mode === "reset") {
      user.resetPasswordCode = newCode;
      user.resetPasswordCodeExpire = expireTime;
    } else {
      return res.status(400).json({ success: false, message: "Invalid mode" });
    }

    await user.save();

    // Send via email if available
    if (user.email) {
      await sendVerificationEmail(user.email, newCode, user.name);
      return res
        .status(200)
        .json({ success: true, message: "Code resent to your email" });
    } else {
      // SMS simulation
      console.log(`[SIMULATED SMS] New Code for ${user.phone}: ${newCode}`);
      return res.status(200).json({
        success: true,
        message: "Code resent to your phone number (Simulated)",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//================================================
