var io = require('socket.io-client');
var serverUrl = 'ws://ymist.gakkori.net:3000/';
var socket = io.connect(serverUrl);

socket.on('getUname', function (data) {
    console.log(data);
        socket.emit('Dingleberries', { my: 'data' });
          });

socket.emit('client', { my: 'data' });

var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
    }).listen(13373, '127.0.0.1');
    console.log('Server running at http://127.0.0.1:1337/');
