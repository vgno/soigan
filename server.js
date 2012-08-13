var express = require('express');
var util = require('util');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var logger = io.log;

io.set('log level', 1);


server.listen(3000);

app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', function (socket) {
    socket.on('yo', function(data) {
        if (data.type == 'client') {
            socket.join('clients');
            socket.emit('status', 'ok');
            io.sockets.in('browsers').emit('newClient', { client: data.id });
            util.log('Got new client "' + data.id + '"' );
        } else if (data.type == 'browser') {
            socket.join('browsers');
            socket.emit('status', 'ok');
            util.log('Got new Browser "' + data.id +  '"' )
        }
    });

    socket.on('getClients', function(data) {
        var roomClients = io.sockets.clients('clients');

        if (roomClients.length != 0) {
            var clients = [];
            roomClients.forEach(function(client) {
                clients.push(client.id);
            });
            
            util.log('Sending clients', clients);
            io.sockets.in('browsers').emit('clientList', { clients: clients });
        } else {
            util.log('Found no clients');
        }
    });

    socket.on('uname', function(data) {
        util.log('Sending uname to browsers', data);
        io.sockets.in('browsers').emit('sendUname', data);
    });

    socket.on('send', function(data) {
        util.log('Sending', data.cmd);
        
        io.sockets.in('clients').emit(data.cmd);
    });

    socket.on('munin', function(data) {
        util.log('Recived Munin data');
        io.sockets('browsers').emit('setMunin');
    });

    socket.on('disconnect', function() {
        io.sockets.in('browsers').emit('leaveClient', { client: socket.id });
    });
    
});

