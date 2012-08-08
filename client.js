var io = require('socket.io-client');
var serverUrl = 'ws://ymist.gakkori.net:3000/';
var socket = io.connect(serverUrl);

socket.on('getUname', function (data) {
    console.log(data);
        socket.emit('Dingleberries', { my: 'data' });
          });

socket.emit('client', { my: 'data' });

var http = require('http');


setInterval(function() {
  console.log('Alive!');
  }, 5000 );
console.log("Starting up!");
