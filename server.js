var express = require('express');
var app = express();
var server = app.listen(6789, function() { console.log("Server on 6789..."); });
var io = require('socket.io').listen(server);
var request = require('request');

app.use(express.static('./static'));

server.listen(6789);
console.log("Running in localhost at port 6789");

io.sockets.on('connection', function (socket) {

  socket.on('get_conversations', function (data) {
    console.log("DATA IN GET CONVERSATIONS");
    request({
      uri: "http://localhost:3000/conversations/" + data.current_user.id,
      method: "GET",
      json: true
    }, function (error, res, body) {
      if (error) {
        console.log("ERRORS IN GET_CONVERSATIONS REQUEST");
        console.log(error);
      } else {
        io.emit('conversations', body);
      }
    });
  });

  socket.on('send_message', function (data) {
    request({
      uri: "http://localhost:3000/messages/",
      method: "POST",
      json: { data: data },
    }, function (error, res, body) {
      if (error) {
        console.log("ERRORS IN SEND MESSAGE REQUEST");
        console.log(error);
      } else {
        io.emit('conversations', body);
      }
    });
  });



});