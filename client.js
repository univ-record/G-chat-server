const net = require('net');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var room = '3';
var id = 'Tester';
var pw = 'tester';
var nick = 'Tester';
rl.on("line", function (line) {
    if (line.startsWith(':c')) {
        client.write('{"id":"' + id +'","nick":"' + nick + '","room":"' + l + '","time":"' + new Date().getTime() + '","cmd":"CREATE_ROOM"}');
    } else if (line.startsWith(':s')) {
        client.write('{"id":"' + id +'","nick":"' + nick + '","time":"' + new Date().getTime() + '","cmd":"JOIN_SERVER"}');
    } else if (line.startsWith(':w ')) {
        var l = line.substr(3);
        console.log('!) ChatRoom Changed ' + l);
        room = l;
    } else if (line.startsWith(':r')) {
        client.write('{"id":"' + id +'","room":"' + room + '","time":"' + new Date().getTime() + '","cmd":"REQUEST_CHAT"}');
    }  else if (line.startsWith(':l')) {
        client.write('{"id":"' + id +'","password":"' + pw + '","time":"' + new Date().getTime() + '","cmd":"Login"}');
    } else {
        client.write('{"id":"' + id +'","nick":"' + nick + '","room":"' + room + '","time":"' + new Date().getTime() + '","cmd":"chat","chat":"' + encodeURIComponent(line) + '"}');
    }
}).on("close", function () {
    process.exit();
});


/** @type {net.Socket} */
var client = net.connect({ host: '175.196.255.238', port: 8080 });
//var client = net.connect({ host: 'localhost', port: 8080 });

client.setKeepAlive(true);

client.on('data', function (data) {
    console.log("From Server: " + data.toString());
});

client.on('end', function () {
    console.log('Client disconnected');
});

client.on('error', function (err) {
    console.log('Socket Error : ' + err);
});

client.on('timeout', function () {
    console.log('Socket Timed Out');
});

client.on('close', function () {
    console.log('Socket Closed');
    process.exit();
});
