var NodeGit = require("nodegit");
var Promise = require("promise");
var path = require('path');
var fse = require('fs-extra');

function data (options) {
  var repo;

  if(!options.repo) {
    throw new Error("please provide a valid repo");
  }

  repo  = options.repo;

  var pathToRepo = require("path").resolve(repo);
  var results = {};
  var repository = NodeGit.Repository.open(pathToRepo);

  return {
    clone: function(pathToClone) {
      var repository = NodeGit.Clone(path.resolve(pathToClone), pathToRepo);
    },

    push: function(ref, username) {
      var remote;
      Promise.resolve(repository).then(function(repo) {
        remote = NodeGit.Remote.lookup(repo, "origin")
          .then(function(remote) {
            remote.push(ref,
              { callbacks: {
                credentials: function(url, username) {
                  Cred.usernameNew (username);
                }
              }
              });
          });
      });
    },

    pull: function() {
      var repo;
      Promise.resolve(repository).then(function(repoResult) {
        repo = repoResult;
        return repo.fetchAll({
          callbacks: {
            credentials: function(url, username) {
                  Cred.usernameNew (username);
            },
            certificateCheck: function() {
              return 1;
            }

          }
        }
        ).then(function() {
          // fast-forward, aka merge our local branch onto the one fetched
          // from master
          return repo.mergeBranches("master", "origin/master");
        }).done(function() {
          return "Done";
        });
      });
    },

    commit: function(user, fileName, fileContent, message) {
      author = NodeGit.Signature.create(user.name, user.email, Date.now(), 240);
      var repo;
      var index;
      var oid;
      var cid;

      Promise.resolve(repository).then(function(repoResult) {
        repo = repoResult;
      }).then(function() {
        return fse.writeFile(path.join(repo.workdir(), fileName), fileContent);
      }).then(function() {
        return repo.refreshIndex();
      }).then(function(indexResult) {
        index = indexResult;
      }).then(function() {
        return index.addByPath(fileName);
      }).then(function() {
        return index.write();
      }).then(function() {
        return index.writeTree(); 
      }).then(function(oidResult) {
        oid = oidResult;
        return NodeGit.Reference.nameToId(repo, "HEAD");
      }).then(function(head) {
        return repo.getCommit(head);
      }).then(function(parent) {
        return repo.createCommit("HEAD", author, author, message, oid, [parent]);
      }).done(function(commitId) {
        cid = commitId;
      });

      return cid;
    },

    history: function() {
      return Promise.resolve(repository).then(function (repo) {
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
    }
  };
}

module.exports = data;

