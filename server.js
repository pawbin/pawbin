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

const circularJSON = require('circular-json');

const session      = require('express-session');
const MongoStore   = require('connect-mongo')(session);
const flash        = require('connect-flash');
const bodyParser   = require('body-parser');
const headerParser = require('./app/utility/headerParser.js');

const preRender = require('./app/site/preRender.js');

/*
app.use(function(req, res, next) {
  console.log('handling request for: ' + req.url);
  next();
});
*/

require('./config/passport')(passport);

// connect to database
mongoose.connect(config.DBurl, err => {
  console.log('mongoose::', err ? err : 'success');
});
mongoose.set('useFindAndModify', false); 


// allow sessions to be stored on database
let sessionMiddleware = session({
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
});
app.use(sessionMiddleware);

// use less on any .less files in the static folder
// MUST BE BEFORE passport.initialize() https://stackoverflow.com/questions/36052739
app.use(less('static'));

app.use(express.static('static'));

require('./app/site/staticRoutes.js')(app);

// init passport
// try to place this as low as possible so serialization happens only at the end
app.use(passport.initialize());
app.use(passport.session());

// use flash messages which store on user's session and display through render engine
app.use(flash());

// allow req.body to exist, automatically fitted with data from form json, text, etc.
// (may want multer for multipart (uploading user avatar, etc.))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(headerParser());
//app.use(bodyParser.text());

// set views to point at the views folder
//app.set('views', __dirname);

// nunjucks configuration
let njk = nunjucks.configure(
  [__dirname + '/views', __dirname], 
  {
    express: app
  }
);
marked.setOptions({
  gfm: true
});
markdown.register(njk, marked);
njk.addFilter('typeof', function(obj) {
  return typeof obj;
});
njk.addGlobal('getContext', function() { 
  //return this.ctx;
  
  let {settings} = this.ctx;
  let ctx = Object.fromEntries(Object.entries(this.ctx).filter(v => v[0] !== 'settings'));
  ctx.settings = settings;
  return JSON.parse(circularJSON.stringify(ctx));
});

// set view engine to html
app.set('view engine', 'html');





// make the server listen for http connections on a port
const listener = app.listen(port, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

//setTimeout(()=>{
  
//initialize socket.io websocket server
let io = require('socket.io').listen(listener);
io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});
require('./app/site/socket.js').init(io);

//initialize api
require('./app/api.js')(app);

//initialize documents
require('./app/game/documentInit.js');

//app.use(preRender());

//setup routes
require('./app/site/routes.js')(app, passport);

//start game
require('./app/game/setup.js');

//run tests
require('./tests.js');

//}, 2000);
