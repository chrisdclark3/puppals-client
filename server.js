var express = require('express');
var app = express();
var port = process.env.PORT || 5000;
var server = require('http').createServer(app);
server.listen(port);
var io = require('socket.io')(server);
var request = require('request');

app.use(express.static('./static'));

io.sockets.on('connection', function (socket) {

  socket.on('get_conversations', function (data) {
    console.log("REQUESTING DATA FROM API IN GET CONVERSATIONS", data);
    request({
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      uri: "//puppals-api.herokuapp.com/conversations/" + data.current_user.id,
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      uri: "//puppals-api.herokuapp.com/messages/",
      method: "POST",
      json: data,
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