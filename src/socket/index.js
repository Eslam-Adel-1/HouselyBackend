import { Server } from 'socket.io';
import Message from '../models/messageModel.js';
import Conversation from '../models/conversationModel.js';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Adjust for production
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join a conversation room
        socket.on('join_conversation', (conversationId) => {
            socket.join(conversationId);
            console.log(`User ${socket.id} joined conversation ${conversationId}`);
        });

        // Handle sending messages
        socket.on('send_message', async (data) => {
            const { conversationId, sender, receiver, message, image, video } = data;

            try {
                // Save message to DB
                const newMessage = await Message.create({
                    conversationId,
                    sender,
                    receiver,
                    message,
                    image,
                    video
                });

                // Update last message in conversation
                await Conversation.findByIdAndUpdate(conversationId, {
                    lastMessage: newMessage._id
                });

                // Emit to the conversation room
                io.to(conversationId).emit('receive_message', newMessage);
            } catch (error) {
                console.error('Socket error - send_message:', error);
            }
        });

        // Handle typing status
        socket.on('typing', ({ conversationId, userId }) => {
            socket.to(conversationId).emit('user_typing', { userId });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};
