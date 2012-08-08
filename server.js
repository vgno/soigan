var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(3000);

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
    socket.on('yo', function(data) {
        if (data.type == 'client') {
            socket.join('clients');
            socket.emit('status', 'ok');
            
            console.log('Got new client');
        } else if (data.type == 'browser') {
            socket.join('browsers');
            socket.emit('status', 'ok');
        }
    });

    socket.on('uname', function(data) {
        console.log('Sending uname to browsers');
        io.sockets.in('browsers').emit('uname', data);
    });

    socket.on('send', function(data) {
        console.log('Sending', data.cmd);
        
        io.sockets.in('clients').emit(data.cmd);
    });
});

