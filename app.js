
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
  // ignoreRoutes: ['images/', 'javascripts/', 'stylesheets/'],
  debug: config.verbose
});

// configuration
app.configure(function () {

  // default
  app.set('port', process.env.PORT || config.server.port);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(stylus.middleware({
    src: path.join(__dirname, 'assets'),
    dest: path.join(__dirname, 'public'),
    compile: function (str, path) {
      return stylus(str)
        .set('filename', path)
        .set('compress', true)
        .use(nib());
    }
  }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.session());
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(i18n.handle);

  // helpers
  app.use(function (req, res, next) {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
  });

  // router
  app.use(app.router);

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

var mongoose = require('mongoose');

mongoose.set('debug', config.verbose);

mongoose.connect(process.env.MONGOHQ_URL || config.database.uri);

mongoose.connection.on('error', function (err) {
  console.error('MongoDB error: ' + err.message);
  console.error('Make sure a mongoDB server is running and accessible by this application');
});

// passport

var
  LocalStrategy = require('passport-local').Strategy,
  User = require('./models/user');

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

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

// default routes
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

// default routes

// routes
require('./routes')(app, config);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
