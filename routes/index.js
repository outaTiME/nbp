
var

  // basic
  fs = require('fs'),
  Path = require('path');

module.exports = function (app, config) {

  app.get('/', function (req, res) {
    res.render('index');
  });

  // custom
  var dir = Path.join(__dirname, 'custom');
  fs.readdirSync(dir).map(function (name) {
    return Path.join(dir, name);
  }).filter(function (path) {
    return fs.statSync(path).isFile();
  }).filter(function (path) {
    return (/\.js$/).test(path);
  }).forEach(function (path) {
    require(path)(app, config);
    if (config.verbose) {
      // FIXME: Export to generic
      console.log('\x1B[0;36mnbp:\x1B[0m route loaded: %s', path);
    }
  });

};
