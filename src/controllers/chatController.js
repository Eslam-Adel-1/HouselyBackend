import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";

// get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user._id] },
    })
      .populate({
        path: "participants",
        match: { _id: { $ne: req.user._id } },
        select: "name image profession",
      })
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get messages for a specific conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId).populate({
      path: "participants",
      select: "name image profession",
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (
      conversation.participants[0].id.toString() !== req.user._id.toString() &&
      conversation.participants[1].id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this conversation",
      });
    }

    const receiver = conversation.participants.find(
      (participant) => participant._id.toString() !== req.user._id.toString(),
    );

    const messages = await Message.find({
      conversationId: conversationId,
    })
      .populate("sender", "name image")
      .sort({ createdAt: 1 });

    if (!messages) {
      return res.status(404).json({
        success: false,
        message: "No messages found",
      });
    }
    res.status(200).json({
      success: true,
      data: { messages, receiver },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// start or get a conversation between two users
export const startConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] },
    })
      .populate({
        path: "participants",
        match: { _id: receiverId },
        select: "name image profession",
      })
      .populate("lastMessage", "message image video");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, receiverId],
      })
        .populate({
          path: "participants",
          match: { _id: receiverId },
          select: "name image profession",
        })
        .populate("lastMessage", "message image video");
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// upload media to cloudinary
export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        url: req.file.path,
        type: req.file.mimetype.startsWith("video") ? "video" : "image",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
