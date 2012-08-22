var os = require('os');
var express = require('express');
var util = require('util');
var uuid = require('node-uuid');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var logger = io.log;

var serverInfo =  {
    "hostname":os.hostname(),
    "type":"server",
    "version":"servers version",
    "protocol":"1",
    "id":"ServerID"
};


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
    socket.on('info', function(data) {
        var clientUuid;
        util.log("Something connected: " + util.inspect(data));
        if (data.type == 'node') {
            socket.join('clients');
            socket.join('nodes');
            if (data.uuid) {
                // Check if this is a valid data.id
                util.log("client sent id" + data.uuid);
                // Let's just say it's a correct id
                clientUuid = data.uuid;
            } else {
                util.log("Unknown client. Creating new uuid");
                clientUuid = uuid.v4();
            }
            var localServerInfo = serverInfo;//clientUUID" =  "foo"
            localServerInfo.uuid = clientUuid;
            localServerInfo.status = "OK";
            data.uuid = clientUuid;
            util.log("localserverinfo: " + util.inspect(localServerInfo));
            socket.emit("info", localServerInfo);
            io.sockets.in('browsers').emit('newClient', { client: data.uuid });
            util.log('Got new client "' + data.uuid + '"' );
        } else if (data.type == 'browser') {
            socket.join('clients');
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

