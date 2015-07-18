var express = require('express');
var app = express();
var port = process.env.PORT || 5000;
var server = require('http').createServer(app);
server.listen(port);
var io = require('socket.io')(server);
var request = require('request');
require('request').debug = true;

app.use(express.static('./static'));

io.sockets.on('connection', function (socket) {

  socket.on('get_conversations', function (data) {
    console.log("REQUESTING DATA FROM API IN GET CONVERSATIONS", data);
    request({
      uri: "https://puppals-api.herokuapp.com/conversations/" + data.current_user.id,
      method: "GET",
       headers: {
        'Access-Control-Allow-Origin': '*',
      },
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
      uri: "https://puppals-api.herokuapp.com/messages/",
      method: "POST",
       headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: { data: data },
      json: true
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