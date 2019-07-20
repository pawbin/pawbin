/**
 * server.js
 * initialize server, set up middleware
 */
const config   = require('./config.js');

const express  = require('express');
const app      = express();
const port     = process.env.PORT;
const path     = require('path');
const nunjucks = require('nunjucks');
const markdown = require('nunjucks-markdown');
const marked   = require('marked');
const less     = require('less-middleware');
const mongoose = require('mongoose');
const passport = require('passport');

const session      = require('express-session');
const MongoStore   = require('connect-mongo')(session);
const flash        = require('connect-flash');
const bodyParser   = require('body-parser');

require('./config/passport')(passport);

// connect to database
mongoose.connect(config.DBurl);

// allow sessions to be stored on database
app.use(session({
  secret: process.env.SECRET,
  cookie: { maxAge: config.anonSessionAge * 10,
           originalMaxAge: config.anonSessionAge * 10,
           expires: new Date(Date.now() + config.anonSessionAge)
          },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: config.anonSessionAge / 1000
  }),
  resave: true,
  saveUninitialized: true
}));
// init passport
app.use(passport.initialize());
app.use(passport.session());

// use flash messages which store on user's session and display through render engine
app.use(flash());

// allow req.body to exist, automatically fitted with data from form json, text, etc.
// (may want multer for multipart (uploading user avatar, etc.))
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));

// set views to point at the views folder
//app.set('views', __dirname);

// nunjucks configuration
let njk = nunjucks.configure(
  [__dirname + '/views', __dirname], 
  {
    express: app
  }
);
markdown.register(njk, marked);
// set view engine to html
app.set('view engine', 'html');
// use less on any .less files in the static folder
app.use(less('static'));

app.use(express.static('static'));

// make the server listen for http connections on a port
const listener = app.listen(port, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

//initialize api
require('./app/api.js')(app);

//setup routes
require('./app/routes.js')(app, passport);

//run tests
require('./tests.js');