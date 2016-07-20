var NodeGit = require("nodegit");
var Promise = require("promise");

function data (options) {
  var repo;

  if(!options.repo) {
    throw new Error("please provide a valid repo");
  }

  repo  = options.repo;

  var pathToRepo = require("path").resolve(repo);
  var results = {};

    return {
      updateBorrow: function() { 
        console.log("Updating Borrow from " + pathToRepo);
      },

      pullRepo: function() {

      },

      getHistory: function() {
        history = NodeGit.Repository.open(pathToRepo).then(function (repo) {
          return repo.getCurrentBranch().then(function(ref) {
            return repo.getBranchCommit(ref.shorthand()).then(function(commit) {
                var hist = commit.history(),
                  p = new Promise(function(resolve, reject) {
                    hist.on('end', resolve);
                    hist.on('error', reject);
                  });
                  hist.start();
                  return p;
          }).then(function(commits) {
            return commits;
          });
        });
      }).catch(function (err) {
          console.log(err);
      });

      return Promise.resolve(history).then(function(commits) {
        console.log("Number of commits: " + commits.length);
        return commits;
      });
    }
  };
}

module.exports = data;

