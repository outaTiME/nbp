
var Helper = require('../../helpers');

module.exports = function (app, config) {

  app.get('/restricted', Helper.ensureAuthenticated, function (req, res) {
    res.render('index');
  });

};
