import { Server } from "socket.io";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import { verifyToken } from "../utils/jwtUtils.js";

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
      const { conversationId, sender, receiver, message, image, video } = data;

      try {
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

        // Emit to the conversation room
        io.to(conversationId).emit("receive_message", newMessage);

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
