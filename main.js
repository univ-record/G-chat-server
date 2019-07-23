const net = require('net');
const mongoose = require('mongoose');

// CONNECT TO MONGODB SERVER
var room_db = mongoose.createConnection('mongodb://localhost:27017/rooms',{useNewUrlParser:true});
room_db.on('error', console.error);
room_db.once('open', function(){
    console.log("Connected to mongod Rooms server");
});
var user_db = mongoose.createConnection('mongodb://localhost:27017/users',{useNewUrlParser:true});
user_db.on('error', console.error);
user_db.once('open', function(){
    console.log("Connected to mongod Users server");
});
var config_db = mongoose.createConnection('mongodb://localhost:27017/config',{useNewUrlParser:true});
config_db.on('error', console.error);
config_db.once('open', function(){
    console.log("Connected to mongod Config server");
});

//find collection
function collection_find (name, query, cb) {
    mongoose.connection.db.collection(name, function (err, collection) {
       collection.find(query).toArray(cb);
   });
}


function User(id, socket) {
    this.id = id;
    this.socket = socket;

    this.setId = function(n) {
        this.id = n;
        return this;
    }
    this.setSocket = function(s) {
        this.socket = s;
        return this;
    }
}

function Room() {
    this.name;
    this.Users = [];

    this.setName = function(n) {
        this.name = n;
        return this;
        find( json.room, query, callback);
    }
    this.addUser = function(u) {
        var isUserExisted = false;
        this.Users.forEach((user, index, array) => {
            if (user.name === u.name)
                isUserExisted = true;
        });
        if (isUserExisted)
            console.log('!) User Named ' + u.name + ' is Already Existed in ' + this.name);
        else
            this.Users.push(u);
        return this;
    }
}

var onlineUsers = [];

var server = net.createServer((socket) => {
    var localAddress = socket.localAddress;
    var localPort = socket.localPort;
    var remoteAddress = socket.remoteAddress;
    var remotePort = socket.remotePort;

    console.log('--------------------Connection---------------------');
    console.log('Client Connect Success')
    console.log('Local = ' + localAddress + ':' + localPort);
    console.log('Remote = ' + remoteAddress + ':' + remotePort);
    console.log('---------------------------------------------------');
    socket.setKeepAlive(true);

    socket.on('data', async (data) => {
        var str = data.toLocaleString();
        var json = JSON.parse(str);
        console.log('-----------------------Data------------------------');
        console.log('Remote = ' + remoteAddress + ':' + remotePort);
        console.log('Data Length : ' + data.length);
        console.log('Data : ' + decodeURIComponent(str));
        console.log('---------------------------------------------------');

        /*var coll = room_db.collection(json.room);
        coll.insertOne(json);
        coll.insertOne(json,(err, rst) => {
            if (err) {
               //console.log('!) MongoDB ERROR OCURRED : ' + err);
            }
        });*/

        //명령어 처리
        //cmd가 undefined가 아닐때
        if (json.cmd !== undefined) {
            console.log('!) ' + json.cmd);
            var id = json.id;
            var roomName = json.room;

            //요기서 id랑 패스워드랑 비교를 하든 뭘하든 JOIN을 Login으로 바꾸든 뭘하든 상관업승ㅁ
            //요기서 onlineUsers << 이거 배열에 유저를 추가함
            if (json.cmd === 'login') {

            }
            if (json.cmd === 'JOIN_SERVER') {
                onlineUsers.push(new User(id,socket));
            } else if (json.cmd === 'CREATE_ROOM') {
                var serverDataCollection = config_db.collection('server_data');

                var serverConfig = await serverDataCollection.findOne({recent_room_num:{$exists:true}});

                var recentRoomNum = serverConfig.recent_room_num + 1;
                serverDataCollection.updateOne({config:'config'},{$set:{recent_room_num:recentRoomNum}});

                var createCollectionResult = await room_db.createCollection(`${recentRoomNum}`);
                var roomCollection = room_db.collection(`${recentRoomNum}`);
                roomCollection.insertOne({config:"config", usersId:[]});          
                roomCollection.updateOne({config:"config"},{$addToSet:{usersId:id}});

            } else if (json.cmd === 'INVITE_ROOM') {
                var room;


            } else if (json.cmd === 'REQUEST_CHAT') {
                var room = json.room;
                var id = json.id;
                var roomCollection = room_db.collection(room);
                var roomConfig = await roomCollection.findOne({config:{$exists:true}});
                var isRoomExisted = (roomConfig)?true:false;
                if (isRoomExisted) {
                    //방에 있는 유저를을 몽고디비에서 불러옴
                    var roomUsersId = roomConfig.usersId;

                    var isUserExisted = roomUsersId.includes(id);
                    //유저들이 온라인이면
                    if (isUserExisted)
                    var roomChats = roomCollection.find({chat:{$exists:true}});
                    roomChats.forEach((doc) => {
                        socket.write('{"id":"' + doc.id + '","room":"' + room + '","time":"' + doc.time +'","chat":"' + doc.chat + '"}');
                    }, (err) => {

                    });
 
                    //socket.write('{"id":"' + id + '","room":"' + roomName + '","time":"' + time +'","chat":"' + msg + '"}');
                } else {
                    console.log('!) Room Named ' + roomName + ' Is Not Existed');
                }
            } else if (json.cmd === 'chat') {
                var msg = json.chat;
                var room = json.room;
                var id = json.id;
                var time = json.time;
                var isRoomExisted = false;
                var chat = JSON.stringify(json.chat);

                var roomCollection = room_db.collection(room);
                var roomConfig = await roomCollection.findOne({config:{$exists:true}});
                var isRoomExisted = (roomConfig)?true:false;

                //방이 있을경우
                if (isRoomExisted) {
                    //방에 있는 유저를을 몽고디비에서 불러옴
                    var roomUsersId = roomConfig.usersId;
                    //유저들이 온라인이면
                    roomUsersId.forEach(userId => {
                        onlineUsers.forEach(user => {
                            if (userId === user.id) {
                                //보냄
                                user.socket.write('{"id":"' + id + '","room":"' + roomName + '","time":"' + time +'","chat":"' + msg + '"}');
                                console.log('!) To ' + user.id + ' {"id":"' + id + '","room":"' + roomName + '","time":"' + time +'","chat":"' + msg + '"}');
                            }
                        });
                    });
                    var roomCollectionInsertResult = await roomCollection.insertOne({id:id,time:time,chat:msg});
                } else {
                    console.log('!) Room Named ' + roomName + ' Is Not Existed');
                }
            }
        }
        
        
    });

    socket.on('close', (err) => {
        console.log('------------------Connection Lost------------------');
        console.log('Remote = ' + remoteAddress + ':' + remotePort);
        console.log('---------------------------------------------------');
        onlineUsers.forEach((user, index)=> {
            if (user.sockt === socket) {
                onlineUsers.splice(index,-1);
            }
        });
    });
    socket.on('error', (err) => {
        console.log('-----------------------Error-----------------------');
        console.log('Remote = ' + remoteAddress + ':' + remotePort);
        console.log('---------------------------------------------------');
    });
});

server.listen(8080);
