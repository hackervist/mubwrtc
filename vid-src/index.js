'use strict'

let os = require('os');
let express = require('express');
let app = express();
let http = require('http');

//  signalling in WebRTC
let socketIO = require('socket.io');

// frontend folder declaration 
app.use(express.static('public'));

// define routes
app.get('/', (req, res) => { res.render("../../vid-src/views/index.ejs") });

let server = http.createServer(app);

// PORTS
server.listen(process.env.PORT || 4000);

// init socketIO
let io = socketIO(server)

// socketIO implementation
io.sockets.on('connection', soc => {
    let log = () => {
        let array = ['Message from Server: '];
        array.push.apply(array, arguments);
        soc.emit('log', array);
    };

    // server behavior on socket events
    soc.on('message', (message, room) => { log('Client said : ', message); soc.in(room).emit('message', message, room);});
    

    // joining/creating room
    soc.on('create or join', (room) => {
        log('Received request to create or join room ' + room);

        // locating clients in room
        let clientsInRoom = io.sockets.adapter.rooms[room];
        let numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
        log("Room " + room + 'now has ' + numClients + ' clients(s)');

        // if not client => create one
        if (numClients === 0) {
            soc.join(room);
            log('Client ID ' + soc.id + 'created room ' + room);
            soc.emit('created', room, socket.id);

        }
        // if client in room ADD client to room
        else if (numClients === 1) {
            log('Client ID ' + soc.id + ' joined room ' + room);
            io.sockets.in(room).emit('join', room);
            soc.join(room);
            soc.emit('joined', room, soc.id);
            io.sockets.in(room).emit('ready');
        }
        // maximum NO of clients
        else {
            soc.emit('full', room);
        }
    });

    // handling events
    soc.on('ipaddr', () => {
        let ifaces = os.networkInterfaces();
        for (let dev in ifaces) {
            ifaces[dev].forEach((details) => {
                if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
                    socket.emit('ipaddr', details.address);
                }
            });
        }
    });


    // notification Event for other clients upon client exiting
    soc.on('bye', () => { console.log('received bye'); })
});

// console.log(server)