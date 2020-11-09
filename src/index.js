const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);


const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

let count = 0;

io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('disconnect', () => {
      io.emit('sendToAll', "A user has left");
    });

    socket.on('sendMessage', (msg) => {
      io.emit('sendToAll', msg);
    });

    socket.broadcast.emit('sendToAll', "A new user has joined")

    socket.on('sendLocation', (pos) => {
      socket.broadcast.emit('sendToAll', `https://google.com/maps?q=${pos.latitude},${pos.longitude}`);
    })
  });

server.listen(port, () => {
    console.log(`Server is up at port ${port}`);
})
