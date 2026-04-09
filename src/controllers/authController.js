import User from "../models/userModel.js";
import { hashPassword } from "../utils/passwordUtils.js";
import { generateToken } from "../utils/jwtUtils.js";
import { sendVerificationEmail } from "../utils/emailUtils.js";
import { registerSchema } from "../ValidationSchemas/authSchemas.js";

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
