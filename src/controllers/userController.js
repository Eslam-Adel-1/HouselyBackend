// models imports
import User from "../models/userModel.js";
//cloudinary imports
import { cloudinary } from "../config/cloudinary.js";
import { cloudinaryPublicId } from "../utils/cloudinaryUtils.js";

//=========================================================

export const getUserLocation = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };
    await user.save();
    return res.status(200).json({
      success: true,
      data: {
        coordinates: {
          longitude,
          latitude,
        },
      },
      message: "Location updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//=========================================================

export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, profession } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.profession = profession || user.profession;

    await user.save();
    return res.status(200).json({
      success: true,
      data: user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//=========================================================

export const updateProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }
    // Destroy the previous image if it exists and is not the default
    if (user.image && !user.image.includes("default-user.jpg")) {
      try {
        const publicId = cloudinaryPublicId(user.image);
        await cloudinary.uploader.destroy(publicId);
      } catch (destroyError) {
        console.log("CLOUDINARY DESTROY ERROR", destroyError);
      }
    }

    user.image = req.file.path;

    await user.save();

    return res.status(200).json({
      success: true,
      data: user,
      message: "Profile image updated successfully",
    });
  } catch (error) {
    console.log("UPLOAD ERROR", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//=========================================================
