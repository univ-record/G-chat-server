const net = require('net');
const mongoose = require('mongoose');
/*
function connect(){
    if (process.env.NODE_ENV !== 'prodection') {
        mongoose.set('debug', true);
    }
    //mongoose.connect('mongodb://root:toor@localhost:27017/nodejs/admin');
    mongoose.connect('mongodb://root:toor@localhost:27017/', {
        dbName: 'nodejs',
    }, (error) => {
        if (error) {
            console.long('connect error');
        }
        else {
            console.log('succesfully connected');
        }
    });
};

connect();

mongoose.connection.on('error', (error) => {
    console.error('몽고디비 연결 에러', error);
});
mongoose.connection.on('disconected', () => {
    console.error('몽고디비 연결이 끊겼습니다.재연결을 시도합니다. ');
    connect();
});
*/
var server = net.createServer((socket) => {
    var la = socket.localAddress;
    var lp = socket.localPort;
    var ra = socket.remoteAddress;
    var rp = socket.remotePort;


    console.log("--------------------Connection---------------------");
    console.log("Client Connect Success")
    console.log('Local = ' + la + ':' + lp);
    console.log('Remote = ' + ra + ':' + rp);
    console.log("---------------------------------------------------");
    socket.setKeepAlive(true);

    socket.on('data', (data) => {
        var str = data.toLocaleString();
        var jn = JSON.parse(str);
        var d1 = new Date(Number(jn.time));
        //log
        console.log("-----------------------Data------------------------");
        console.log('Remote = ' + ra + ':' + rp);
        console.log("Data Length : " + data.length);
        console.log("Data : " + str);
        console.log("room : " + jn.room);
        console.log("id : " + jn.id);
        console.log("time : " + d1);
        console.log("chat : " + jn.chat);
        console.log("---------------------------------------------------");
        //save msg
        mongoose.connect('mongodb://localhost/nodejs', { useNewUrlParser: true });

        //send msg each client

    });

    socket.on('close', (err) => {
        console.log("------------------Connection Lost------------------");
        console.log('Remote = ' + ra + ':' + rp);
        console.log("---------------------------------------------------");
    });

    socket.on('error', (err) => {

    });


});

server.listen(8080);
