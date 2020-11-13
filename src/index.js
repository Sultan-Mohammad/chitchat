const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);


const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log(generateMessage('a user connected'));
    
    socket.on('disconnect', () => {
      io.emit('sendToAll', generateMessage("A user has left"));
    });

    socket.on('join', ({username, room}) => {
      socket.join(room);
      socket.emit('sendMessage', generateMessage('Welcome'));
      socket.to(room).broadcast.emit('sendToAll', generateMessage(`${username} has joined`));
    })

    socket.on('sendMessage', (msg, callback) => {
      const filter = new Filter();

      if (filter.isProfane(msg)) {
        return callback('Profanity is not allowed');
      }
      io.to('').emit('sendToAll', generateMessage(msg));
      callback(generateMessage('Recieved!'));
    });

    socket.on('sendLocation', (pos, callback) => {
      io.to('').emit('sendLocationToAll', generateLocationMessage(`https://google.com/maps?q=${pos.latitude},${pos.longitude}`));
      callback();
    });
    
  });

server.listen(port, () => {
    console.log(`Server is up at port ${port}`);
})
