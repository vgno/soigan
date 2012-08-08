var os = require('os');
var io = require('socket.io-client');
var serverUrl = 'ws://ymist.gakkori.net:3000/';
var socket = io.connect(serverUrl);

socket.emit('yo', { 'type': 'client', 'id': os.hostname })

socket.on('getUname', function (data) {
    console.log(data);
        socket.emit('uname', { 'uname': os.type });
          });

var http = require('http');


setInterval(function() {
  console.log('Alive!');
  }, 5000 );
console.log("Starting up!");
