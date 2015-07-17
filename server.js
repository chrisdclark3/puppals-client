var express = require('express');
var app = express();
var port = process.env.PORT || 5000;
var server = app.listen(port, function() {
  var addr = app.address();
  console.log('   app listening on http://' + addr.address + ':' + addr.port);
});
var io = require('socket.io').listen(server);
var request = require('request');

io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 20);
});

app.use(express.static('./static'));

io.sockets.on('connection', function (socket) {

  socket.on('get_conversations', function (data) {
    console.log("DATA IN GET CONVERSATIONS");
    request({
      uri: "//puppals-api.heroku-app.com/conversations/" + data.current_user.id,
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
      uri: "//puppals-api.heroku-app.com/messages/",
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