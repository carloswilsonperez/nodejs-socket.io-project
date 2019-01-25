var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
mongoose.Promise = Promise; // To let Mongoose know we are using the ES6 Promise library

app.use(express.static(__dirname));  // To serve index.html
// To parse JSON post data
app.use(bodyParser.json());

// POST data coming from browsers is url-encoded
app.use(bodyParser.urlencoded({extended: false}));

// url for connecting to remote MongoDB database
var dbUrl = 'mongodb://user:cwilson1974@ds011389.mlab.com:11389/learning-node';

var Message = mongoose.model('Message', {
    name: String,
    message: String
});

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages);
    });
});

app.post('/messages', async (req, res) => {
    try {
        var message = new Message(req.body);
        var savedMessage = await message.save();
        io.emit('message', req.body);
        res.sendStatus(200);
    } catch(error) {
        res.sendStatus(500);
        return console.error(error);
    }

    /*
    message.save()
    .then(() => {
        io.emit('message', req.body);
        res.sendStatus(200);
    }).catch((err) => {
        res.sendStatus(500);
        return console.error(err);
    });
    */
    console.log(req.body);
});

io.on('connection', (socket) => {
    console.log('a user connected');
});

// Connecting to Mongoose
mongoose.connect(dbUrl, {useNewUrlParser: true}, (err) => {
    console.log('MongoDB connection', err);
});
var server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port);
});