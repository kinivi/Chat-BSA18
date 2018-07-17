let express = require('express');
let app = express();
let http = require('http').Server(app);
let bodyParser = require('body-parser');
let path = require('path');

let messages = [];
let users = [];
let id = 0;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Route
app.use(express.static(path.join(__dirname, 'public')));


function checkIfOverflow(messages) {
    if (messages.length > 100) {
        messages.splice(0, 1);
    };
};


app.get('/messages', function (req, res) {
    res.json(messages);
    res.status(200);
    res.end();
})

app.post('/messages', function (req, res) {
    messages.push(req.body);
    checkIfOverflow(messages);
    res.status(200);
    res.end();
});

app.get('/users', function (req, res) {
    res.json(users);
    res.status(200);
    res.end();
});

app.post('/users', function (req, res) {
    users.push(req.body);
    res.status(200);
    res.end();
});


http.listen(5000, function () {
    console.log('listening on *:5000');
});
