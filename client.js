var os = require('os');
var io = require('socket.io-client');
var util = require('util');
var exec = require('child_process').exec;
var fs = require('fs');
var child;

var serverUrl = 'ws://localhost:3000/';
var socket = io.connect(serverUrl);

try {
var identity = fs.readFileSync("identity").toString();
}

catch (err) {
    util.log("Could not load identifyfile" + err);
}

util.log("identiy is " + identity);

socket.on('connect', function() {
    util.log("Connected to " + serverUrl);
    if (identity) {
        socket.emit('info', { 'type': 'node', 'uuid': identity, 'hostname': os.hostname() });
    } else {
        socket.emit('info', { 'type' : 'node', 'hostname': os.hostname() });
    }
    socket.on('info', function(data) {
        util.log("We got something back" + util.inspect(data));
    });
    setInterval(function() {
        util.log('Munin Push!');

    }, 10000 );

});

socket.on('disconnect', function() {
    util.log("Disconnected from " + serverUrl);
});


socket.on('reconnecting', function () {
    util.log("reconnecting to " + serverUrl);
});

socket.on('reconnect', function () {
    util.log("reconnected to " + serverUrl);
});

socket.on('connect_failed', function () {
    util.log("Connect Failed to " + serverUrl);
});

socket.on('reconnect_failed', function () {
    util.log("Reconnect Failed to " + serverUrl);
});

socket.on('getUname', function () {
    util.log('Asked for uname', os.type());
    socket.emit('uname', { type: os.type() });
});

socket.on('munin', function (data) {
    util.log("Fire off a munin plugin and return data");
    switch(data.action) {
        case "fetch":
            util.log("Executing plugin");
            child = exec('ls | wc -l',
                function (error, stdout, stderr) {
                    util.log('stdout: ' + stdout);
                    socket.emit('munin', { type: stdout });
                    util.log('stderr: ' + stderr);
                    if (error !== null) {
                        util.log('exec error: ' + error);
                    }});
            break;
        default:
            util.log("What happend here?");
    }

});


util.log("Starting up!");




setInterval(function() {
    console.log('Still Alive!');
}, 50000 );

