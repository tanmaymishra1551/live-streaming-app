const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
// const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// app.use(cors({
//   origin: 'http://localhost:8080' // Allow requests from this origin
// }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));


// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('chatMessage', (message) => {
    io.emit('chatMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
