var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var sockateer = require('./sockateer');
var Data = require('./data');
var express = require('express');
var errorhandler = require('errorhandler');
var Promise = require('promise');

var data = Data({
  repo: "/Users/sam/Projects/dataClone"
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


app.get('/clone', function(req, res) {
  data.clone("/Users/sam/Projects/data");
  res.json({status: "ok"});
});

app.get('/push', function(req, res) {
  data.push(["refs/heads/master:refs/heads/master"], "sam");
  res.json({status : "ok"});
});

app.get('/pull', function(req, res) {
  data.pull();
  res.json({status : "ok"});
});

app.get('/update', function(req, res) {
  user = { name: 'Sam Hamilton', email: 'samilton@gmail.com' };
  filePath = "sam.txt";
  fileContents = new Date();
  commitId = data.commit(user, filePath, fileContents, "testing");
  res.json(commitId);
});

app.get('/history', function(req, res) {
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
