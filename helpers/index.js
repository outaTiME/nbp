
module.exports = {

  /** Check user auth, if not redirs to login. **/
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }

};
