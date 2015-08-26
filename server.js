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

  socket.on('getConversations', function (data) {
    console.log("Server > getConversations > data", data);
    request({
      uri: "https://puppals-api.herokuapp.com/conversations/" + data.currentUser.id,
      method: "GET",
       headers: {
        'Access-Control-Allow-Origin': '*',
      },
      json: true
    }, function (error, res, body) {
      console.log("BODY", body);
      if (error) {
        console.log(error);
      } else {
        console.log("BODY", body);
        io.emit('conversations', body);
      }
    });
  });

  socket.on('sendMessage', function (data) {
    console.log("Server > sendMessage > data", data);
    request({
      uri: "https://puppals-api.herokuapp.com/messages/",
      method: "POST",
       headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: { data: data },
      json: true
    }, function (error, res, body) {
      console.log("BODY", body);
      if (error) {
        console.log(error);
      } else {
        io.emit('conversations', body);
      }
    });
  });



});