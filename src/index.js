const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const {addUser, getUser, removeUser, getUsersInRoom} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);


const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log(generateMessage('a user connected'));
    
    socket.on('disconnect', () => {
      const user = removeUser(socket.id);
      if (user) {
        io.to(user.room).emit('sendToAll', generateMessage("System", `${user.username} has left`));
        io.to(user.room).emit('roomData', {
          room: user.room,
          users: getUsersInRoom(user.room)
        });
      }
    });

    socket.on('join', (options, callback) => {
      const {error, user} = addUser({id: socket.id, ...options});

      if (error) {
        return callback(error);
      }

      socket.join(user.room);
      socket.emit('sendMessage', generateMessage('Welcome'));
      socket.to(user.room).broadcast.emit('sendToAll', generateMessage('System',`${user.username} has joined`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
      callback();
    })

    socket.on('sendMessage', (msg, callback) => {
      const filter = new Filter();

      if (filter.isProfane(msg)) {
        return callback('Profanity is not allowed');
      }

      const user = getUser(socket.id);

      io.to(user.room).emit('sendToAll', generateMessage(user.username, msg));
      callback(generateMessage('Recieved!'));
    });

    socket.on('sendLocation', (pos, callback) => {
      const user = getUser(socket.id);
      io.to(user.room).emit('sendLocationToAll', generateLocationMessage(user.username,`https://google.com/maps?q=${pos.latitude},${pos.longitude}`));
      callback();
    });
    
  });

server.listen(port, () => {
    console.log(`Server is up at port ${port}`);
})
