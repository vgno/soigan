var express = require('express');
var util = require('util');
var uuid = require('node-uuid');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var logger = io.log;

io.set('log level', 1);


server.listen(3000);

app.use(express.static(__dirname + '/public'));

/* channels
 core - core commands (or use auth)
 munin - munin stuff
 deploy - Deploymentstuff
 func - run a command
 info - sending information back and forth

 New client
 1. client connects sends type, id, version, hostname

 "core", { action: "auth",

 http://www.danielbaulig.de/socket-ioexpress/ (use sio.set('authorization', function (data, accept) {)
 */

io.sockets.on('connection', function (socket) {
    socket.on('auth', function(data) {
        if (data.type == 'client') {
            socket.join('clients');
            if (data.id) {
                // Check if this is a valid data.id
                util.log("client sent id" + data.id);
                // Let's just say it's a correct id
                socket.emit('core', {"status": "ok"})
            } else {
                var id = uuid.v4();
                socket.emit('info', { 'uuid': id });
                util.log("Sending " + id + " to new client");
            }
            socket.emit('status', 'ok');
            io.sockets.in('browsers').emit('newClient', { client: data.id });
            util.log('Got new client "' + data.id + '"' );
        } else if (data.type == 'browser') {
            socket.join('browsers');
            socket.emit('status', 'ok');
            util.log('Got new Browser "' + data.id +  '"' )
        }
    });

    socket.on('getClients', function() {
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

    socket.on('sendMunin', function(data) {
        util.log('Recived Munin data');
        io.sockets('browsers').emit('displayMunin');
    });

    socket.on('disconnect', function() {
        io.sockets.in('browsers').emit('leaveClient', { client: socket.id });
    });


});

