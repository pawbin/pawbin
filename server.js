/**
 * server.js
 * initialize server, set up middleware
 */

//includes
const express  = require('express');
const app      = express();
const port     = 3000;
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

require('./config/passport')(passport);

const configDB = require('./config/db.js');

//express configuration
app.use(cookieParser('secret'));
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));


const cookieExpire = 14 * 24 * 60 * 60 * 1000 //14 days

//connect to database (before session config)
mongoose.connect(configDB.url); 
//passport sessions. stored in mongodb for 14 days
app.use(session({
  secret: process.env.SECRET,
  cookie: { maxAge: cookieExpire,
            originalMaxAge: cookieExpire,
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

app.listen(port, (err) => {
    if(err){
        return console.log('listen error: ', err);
    }    
    console.log(`server is listening on ${port}`);
});

//const io = require('socket.io')(app);

//require('./app/routes.js')(app, io);
require('./app/routes.js')(app, passport);