let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let path = require('path');

let messages = [];
let users = [];
let id = 0;
let timeouts = [];
let typingUsers = [];

let timeoutConnectionOnlineFunction = function () {
    let userId = arguments[0];
    users[userId].status = "online";

    let data = {
        userId: userId,
        status: "online"
    };
    io.emit("changed connection status", data);
};

let timeoutConnectionOfflineFunction = function () {
    let userId = arguments[0];
    users[userId].status = "offline";

    let data = {
        userId: userId,
        status: "offline"
    };
    io.emit("changed connection status", data);
};

//Route
app.use(express.static(path.join(__dirname, 'public')));


io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('chat message', (msg) => {
        messages.push(msg);
        checkIfOverflow(messages);
        io.emit('chat message', msg);
    });

    socket.on('user entered', (user) => {
        user.id = id++;
        user.socketId = socket.id;
        let timeout = setTimeout(timeoutConnectionOnlineFunction, 60000, [user.id]);
        timeouts[user.id] = timeout;
        users.push(user);

        io.emit('user entered', user);
    });

    socket.on('user typing', (user) => {
        if (!typingUsers.includes(user)) {
            typingUsers.push(user);
        }
        io.emit('user typing', typingUsers);

    });

    socket.on('user ended typing', (user) => {
        typingUsers.splice(typingUsers.indexOf(user), 1);
        io.emit('user typing', typingUsers);
    });

    socket.on('disconnect', () => {
        let userId;


        userId = users.find((user) => {
            return user.socketId == socket.id;
        }).id;

    
        clearTimeout(timeouts[userId]);
        let timeout = setTimeout(timeoutConnectionOfflineFunction, 60000, [userId]);
        timeout[userId] = timeout;

        let data = {
            userId: userId,
            status: "just-left"
        };

        io.emit('changed connection status', data);
    })

    socket.emit('chat history', messages);
    socket.emit('get all users', users);
})

http.listen(5000, function () {
    console.log('listening on *:5000');
});


function checkIfOverflow(messages) {
    if (messages.length > 100) {
        messages.splice(0, 1);
    };
}
