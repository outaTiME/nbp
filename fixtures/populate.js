
/**
 * Populate.
 */

var

  // configuration
  config = require('config'),

  // basic
  async = require('async'),

  // mongoose
  mongoose = require('mongoose'),

  // models
  User = require('../models/user');

// FIXME: Export to generic
mongoose.set('debug', config.verbose);
mongoose.connect(process.env.MONGOHQ_URL || config.database.uri);
mongoose.connection.on('error', function (err) {
  console.error('MongoDB error: ' + err.message);
  console.error('Make sure a mongoDB server is running and accessible by this application');
});

var createUser = function (username, password, role, callback) {
  console.log('Creating user "' + username + '"');
  var user = new User({
    username: username,
    password: password
  });
  if (typeof role === "string") { // if no role default
    user.role = role;
  }
  user.save(callback);
};

var createUsers = function (callback) {
  async.parallel([
    function (cb) { createUser('admin', 'admin', 'admin', cb); },
    function (cb) { createUser('user', 'user', null, cb); }
  ], callback);
};

async.series([createUsers], function (err) {
  if (err) {
    console.dir(err);
  } else {
    console.log('Population complete!');
  }
  setTimeout(function () {
    mongoose.connection.close();
  }, 1000);
});
