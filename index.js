import http from 'http';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { initSocket } from './src/socket/index.js';

// Connect to Database
connectDB();

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
