import { Server } from "socket.io";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import { verifyToken } from "../utils/jwtUtils.js";
import { cloudinary } from "../config/cloudinary.js";

//======================================================
let io;

// initialize socket
export const initSocket = (server) => {
  // save server instance
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust for production
      methods: ["GET", "POST"],
    },
    maxHttpBufferSize: 1e8, // 100 MB buffer size for large video base64 payloads
  });

  //==================================
  // dedicated socket.io auth middleware
  // reads token from socket.handshake.auth.token (set by the client on connect)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Unauthorized: No token provided"));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Unauthorized: User not found"));
      }

      // attach user to socket for use in event handlers
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error("Unauthorized: Invalid token"));
    }
  });

  //==================================
  // socket connection
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    const user = socket.user;

    // Join a conversation room
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.id} joined conversation ${conversationId}`);
    });

    // Handle sending messages
    socket.on("send_message", async (data) => {
      let { conversationId, sender, receiver, message, image, video, tempId } = data;

      try {
        // If there's an image or video, handle uploading
        if (image || video) {
          // Notify the room that a media file is being uploaded (Loading Indicator)
          io.to(conversationId).emit("upload_status", {
            conversationId,
            tempId,
            status: "uploading",
          });

          if (image && image.startsWith("data:")) {
            const uploadResponse = await cloudinary.uploader.upload(image, {
              folder: "housely/chat",
              resource_type: "image",
            });
            image = uploadResponse.secure_url;
          }

          if (video && video.startsWith("data:")) {
            const uploadResponse = await cloudinary.uploader.upload(video, {
              folder: "housely/chat",
              resource_type: "video",
            });
            video = uploadResponse.secure_url;
          }
        }

        // Save message to DB
        const newMessage = await Message.create({
          conversationId,
          sender,
          receiver,
          message,
          image,
          video,
        });

        // Update last message in conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: newMessage._id,
        });

        // Emit to the conversation room (including the sender to confirm save)
        io.to(conversationId).emit("receive_message", {
          ...newMessage._doc,
          tempId, // Send back tempId so client can replace loading state
        });

        console.log(`Message sent in room ${conversationId}`);
      } catch (error) {
        console.error("Socket error - send_message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing status
    socket.on("typing", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("user_typing", { userId });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
