function sockateer (options) {
  var io;
  var subject;

  if(!options.io) {
    throw new Error("can't start with a valid socket handler");
  }

  if(!options.subject) {
    subject = "demo";
  } else {
    subject = options.subject;
  }

  io = options.io;

    return {
      start: function() {
        io.on('connection', function(socket) {
          socket.emit(subject, { time: 'world' });

          socket.on('my other event', function (data) {
            socket.emit('my other event', { time: new Date().getTime() });
            console.log(data);
          });
        });
      }
    };
}

module.exports = sockateer;

