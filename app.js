
/**
 * Generic node boilerplate.
 */

var

  // basic
  express = require('express'),
  http = require('http'),
  path = require('path'),

  // styles
  stylus = require('stylus'),
  nib = require('nib'),

  // routes
  routes = require('./routes'),
  // user = require('./routes/user'),

  // translation
  i18n = require('i18next'),

  // HTML5 Boilerplate
  h5bp = require('h5bp'),

  // configuration
  config = require('config'),

  // passport
  passport = require('passport'),

  // flash
  flash = require('connect-flash'),

  // application
  app = express();

i18n.init({
  fallbackLng: 'en',
  debug: config.verbose
});

// configuration
app.configure(function () {
  app.set('port', process.env.PORT || config.server.port);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(i18n.handle);
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(stylus.middleware({
    src: path.join(__dirname),
    dest: path.join(__dirname, 'public'),
    compile: function (str, path) {
      return stylus(str)
        .set('filename', path)
        .set('compress', true)
        .use(nib());
    }
  }));
  app.use(express.static(path.join(__dirname, 'public')));
  // bp
  app.use(h5bp.ieEdgeChromeFrameHeader());
  app.use(h5bp.protectDotfiles());
  app.use(h5bp.blockBackupFiles());
  app.use(h5bp.removePoweredBy());
  app.use(h5bp.crossDomainRules());
  app.use(h5bp.suppressWww(true));
  app.use(h5bp.removeEtag());
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

i18n.registerAppHelper(app);

// mongoose

var
  mongoose = require('mongoose');

mongoose.set('debug', config.verbose);

mongoose.connect(process.env.MONGOHQ_URL || config.database.uri);

// passport

var
  LocalStrategy = require('passport-local').Strategy,
  User = require('./models/user');

passport.use(new LocalStrategy(
  function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          message: 'Unknown user'
        });
      }
      // test a matching password
      user.comparePassword(password, function (err, isMatch) {
        if (err) {
          return done(err);
        }
        if (!isMatch) {
          return done(null, false, {
            message: 'Invalid password'
          });
        }
      });
      return done(null, user);
    });
  }
));

app.get('/login', function (req, res) {
  var user = req.user, message = req.flash('error');
  res.render('login', {
    user: user,
    message: message
  });
});

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
);

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// default routes

app.get('/', routes.index);

// app.get('/users', ensureAuthenticated, user.list);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
