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
app.get('/', (req, res)=> {res.render('index.ejs')});

let server = http.createServer(app);

// PORTS
server.listen(process.env.PORT || 8888);

// init socketIO
let io = socketIO(server)



console.log(server)