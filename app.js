const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
PORT = process.env.PORT || 3000
let users = {};



app.get('/', (req, res) => {
    res.send('socket.io...');
});

io.on('connection', (socket) => {
    console.log('Socket connected');

    socket.on('increment', (counter) => {
        console.log("increment");
        io.sockets.emit('COUNTER_INCREMENT', counter + 2);
    });

    socket.on('decrement', (counter) => {
        console.log("decrement");
        io.sockets.emit('COUNTER_DECREMENT', counter - 2);
    });

   //chatting
    socket.on('login', (username) => {
        console.log('LOGIN');
        if(users[username]){
            socket.emit('USER_EXISTS');
            return;
        }

        socket.username = username;
        users[username] = username;

        socket.emit('LOGIN', {
            username: socket.username,
            users
        });

        socket.broadcast.emit('USER_JOINED', {
            username: socket.username,
            users
        });
    });

    socket.on('newMessage', (message) => {
        console.log('NEW_MESSAGE');
        // socket.broadcast.emit('NEW_MESSAGE', socket.username + ': ' + message);
        socket.broadcast.emit('NEW_MESSAGE', `${socket.username}: ${message}`);
        socket.emit('NEW_MESSAGE', `You: ${message}`);
    });

    socket.on('disconnect', () => {
        if(users[socket.username]){
            delete users[socket.username];
            socket.broadcast.emit('USER_LEFT', {
                username: socket.username,
                users
            });
        }
    });

});

server.listen(PORT, () => {
    console.log("listening on PORT" + PORT);
});

module.exports = app;
