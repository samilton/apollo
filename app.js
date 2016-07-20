var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var sockateer = require('./sockateer');
var Data = require('./data');
var express = require('express');
var errorhandler = require('errorhandler');
var Promise = require('promise');

var data = Data({
  repo: "."
});

sockateer( {
  io: io,
  subject: "news"
}).start();

server.listen(3000);

app.use(errorhandler());

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/borrow', function(req, res) {
  Promise.resolve(data.getHistory()).then(function(results) { 
      var commits = []; 

      for(i=0; i<results.length; i++) {
        commits[i] = { 
          sha: results[i].sha(),
          message: results[i].message(),
          author: results[i].author().name(),
          time: results[i].timeMs()
        };
      }

        return commits;
    }).done(function(commits) {
      res.json(commits);
    });
});
