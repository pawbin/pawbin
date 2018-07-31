/**
 * server.js
 * initialize server, set up middleware
 */

//console.log(process.env.PORT)

//JUST FOR GLITCH
var assets = require("./assets");

//includes
const config   = require('./config.js');

const documentInit = require('./app/documentInit.js');

const express  = require('express');
const app      = express();
const port     = process.env.PORT;
const path     = require('path');
const nunjucks = require('nunjucks');
const less     = require('less-middleware');
const mongoose = require('mongoose');
const passport = require('passport');

const session      = require('express-session');
const cookieParser = require('cookie-parser');
const flash        = require('connect-flash');
const bodyParser   = require('body-parser');
const MongoStore   = require('connect-mongo')(session);

const preRender = require('./app/preRender.js');

require('./config/passport')(passport);

//JUST FOR GLITCH
app.use("/assets", assets);

//express configuration
app.use(cookieParser('secret'));
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));


const cookieExpire = config.anonSessionAge //1 hour

//connect to database (before session config)
mongoose.connect(config.DBurl); 

app.set('views', path.join(__dirname, 'views')); //rendered with nunjucks

//nunjucks config
nunjucks.configure(
    'views', {
        express: app
    } 
);

app.set('view engine', 'html');

app.use(less('public'));

app.use(express.static(path.join(__dirname, 'public'))); //allows for serving static files. everything in the 'public/' directory will be served as-is 

//passport sessions. stored in mongodb for 14 days
app.use(session({
  secret: process.env.SECRET,
  cookie: { maxAge: cookieExpire * 10,
            originalMaxAge: cookieExpire * 10,
            expires: new Date(Date.now() + cookieExpire)
          },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: cookieExpire / 1000
  }),
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.listen(port, (err) => {
    if(err){
        return console.log('listen error: ', err);
    }    
    console.log(`server is listening on ${port}`);
});

//const io = require('socket.io')(app);

//preRender, check if requesting database info
app.use(preRender());

//require('./app/routes.js')(app, io);
require('./app/routes.js')(app, passport);