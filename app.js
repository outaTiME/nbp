
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

  config = require('config'),

  // application
  app = express();

i18n.init({
  fallbackLng: 'en',
  debug: config.verbose
});

// configuration
app.configure(function () {
  app.set('port', process.env.PORT || config.port);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(i18n.handle);
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
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

app.get('/', routes.index);
// app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
