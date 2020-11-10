const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);


const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('disconnect', () => {
      io.emit('sendToAll', "A user has left");
    });

    socket.on('sendMessage', (msg, callback) => {
      const filter = new Filter();

      if (filter.isProfane(msg)) {
        return callback('Profanity is not allowed');
      }
      io.emit('sendToAll', msg);
      callback('Recieved!');
    });

    socket.broadcast.emit('sendToAll', "A new user has joined")

    socket.on('sendLocation', (pos, callback) => {
      socket.broadcast.emit('sendToAll', `https://google.com/maps?q=${pos.latitude},${pos.longitude}`);
      callback();
    });
    
  });

server.listen(port, () => {
    console.log(`Server is up at port ${port}`);
})
