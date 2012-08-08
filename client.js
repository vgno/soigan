var os = require('os');
var io = require('socket.io-client');
var serverUrl = 'ws://localhost:3000/';
var socket = io.connect(serverUrl);

socket.on('connect', function() {
    socket.emit('yo', { 'type': 'client', 'id': os.hostname });

    socket.on('getUname', function (data) {
        console.log('Asked for uname', os.type());
        socket.emit('uname', { type: os.type() });
    });
});

setInterval(function() {
  console.log('Alive!');
  }, 5000 );
console.log("Starting up!");
