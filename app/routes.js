/**
 * app/routes.js
 * handles server routing
 * not conventional, uses a regex for matching all requests and parses from that
 * the main benefit of this is it allows us to add static pages to the project without needing to
 * manually route each and every page, by checking if it exists in the 'public/' directory as
 * a last case, or 404ing if not
 */

const fs = require('fs');
const path = require('path');
const circularJSON = require('circular-json');
const request = require('request');
const querystring = require('querystring');
const moment = require('moment');

const config = require('../config.js');
//const preRender = require('../app/preRender.js');

const serverHelper = require('../app/serverHelper');
const postHelper   = require('../app/postHelper');
const creatureHelper = require('../app/creatureHelper');
const gameHelper   = require('../app/gameHelper');
const mailer       = require('../app/mailer');
const formValidate = require('../public/shared/signupValidate');

const Creature   = require('../app/models/creature');

//TODO: this has to be a reference, since user is stored in the req object. session object must be filled after request , making this variable useless besides for reference
//let session = {
//}

// offsetDate is the number of hours offset from GMT
// offsetDate should be PST (GMT-8) normally.
let offsetDate = -8;
let globalDate = Date.now() + (offsetDate*1000*60*60);
let date = moment.utc(globalDate);

console.log(date.format("hh:mm a"))

let session = {};

/**
 * express can identify and modify pages through calls made on "app"
 * The routes function is intended to store all of those calls
 */
function routes(app, passport){
  
  app.use(function(req, res, next){
    let loggedIn = Boolean(req.user),
        user = {};
    
    session = {
      loggedIn,
      user: req.user
    }
    next();
  });

  // identify the 404 directory 
  app.get('/404', function(req, res){
    render404(req, res);
  });
  
  // nychthemericon -- day/night icon based on UTC time
  app.get(/^\/nychthemericon(.png|.svg|.jpe?g|.gif)?$/, function(req, res){
    if(((globalDate / (60 * 60 * 1000)) % 48) < 24){
      request('https://cdn.glitch.com/5dce4cb1-f48b-44b6-92cc-e338cf68eb7f%2Fsun.svg').pipe(res);
    } else {
      request('https://cdn.glitch.com/5dce4cb1-f48b-44b6-92cc-e338cf68eb7f%2Fmoon.svg').pipe(res);
    }
  });
  
  // when the user requests any page
  app.get(/^\/(((?!\.).)*(?:.html)?)$/, function(req, res){
    //TODO: allow case insensitivity
    let dir = req.params[0].replace(/\/$/, ""),
        filename = req.path.replace(/\/$/, "").split('/').pop();
    
    //if logged in, extend session storage expiration date
    if(req.user){
      //console.log(req.session.cookie);
      req.session._garbage = Date();
      req.session.touch();
      req.session.cookie.maxAge = 10 * config.userSessionAge;
      req.session.cookie.expires = new Date(Date.now() + config.userSessionAge);
    }
    //console.log("user", req.user);
    
    // this (very important) string of ifs identifies the directory the user is trying to access
    if(dir === ''){
      //req.flash('notif', {content: "you've done it!", type: 'success'});
      console.log("home");
      res.preRender(root('index'), {notifs: req.flash('notif'), ...session});
    } 
    // help ===================================================================
    else if(dir === 'help'){
      res.preRender(root('help'), {message: ""})
    }
    // profile ===================================================================
    else if(dir === 'profile'){
      //console.log("user", req.user);
      loginCheck(root('profile'), {notifs: req.flash('notif'), ...session, userdump: req.user});
    }
    // signup ===================================================================
    else if(dir === 'signup'){
      res.preRender(root('signup'), {notifs: req.flash('notif'), ...session});
    }
    // verify/* ====================================================================
    else if(/^(verify\/.+)$/.test(dir)){
      serverHelper.verifyEmail(filename).then(function(user){
        if(!req.session.passport){
          req.session.passport = {};
        }
        req.session.passport.user = user._id;
        res.redirect('/profile');
      }).catch(console.error);
    }
    // resend verification =========================================
    else if(dir === 'resendverification'){
      let email = req.query.email
      serverHelper.getTempUser(email).then(tempUser => {
        if(tempUser){
        mailer.sendVerifyEmail(email, tempUser.verifyURL, function(err, info) {
          req.flash('notif', {content: 'A verification email was sent to ' + email, type: "success"})
          res.redirect('/signup');
        });
        } else {
          req.flash('notif', {content: 'There is no non-verified account with the email ' + email, type: "warn"})
          res.redirect('/signup');
        }
      });
    }
    // updateemail/* =================================================================
    else if(/^(updateemail\/.+)$/.test(dir)){
      serverHelper.updateEmail(filename).then(function(user){
        res.redirect('/profile');
      }).catch(console.error);
    }
    // resetpassword/* ==============================================================
    else if(/^(resetpassword\/.+)$/.test(dir)){
      res.preRender(root('resetpassword'), {notifs: req.flash('notif'), ...session});
    }
    // requestreset =================================================================
    else if(dir === 'requestreset'){
      res.preRender(root('requestreset'), {notifs: req.flash('notif'), ...session});
    }
    // logout ===================================================================
    else if(dir === 'logout') {
      if(req.user){
        req.session.cookie = {};
      }
      req.session.destroy(function() {
          res.clearCookie('connect.sid');
          res.redirect('/');
      });
    }
    
    /*
    else if(/^(collect\/.+)$/.test(dir)){
      Creature.findOne({$or: [{ 'name' : { $regex : new RegExp(filename, "i") } }, { '_id' : filename }]}, function(err, creature) {
        if(creature.name.toLowerCase() === filename.toLowerCase()){
          if(req.user.admin){
            
          }
        }
      });
    }
    */
    
    else if(dir === 'catch'){
      if(req.user && req.user.rights === "admin"){
        gameHelper.catchCreature(req.user, "frizzbee").then((user, creatureInstance) => {
          req.flash('notif', {content: "caught: frizzbee", type: "success"});
          res.redirect('/');
        });
      }
    }
    
    else if(/^(catch\/.+)$/.test(dir)){
      if(req.user && req.user.rights === "admin"){
        gameHelper.catchCreature(req.user, filename).then((user, creatureInstance) => {
          req.flash('notif', {content: "caught: " + creatureInstance._id, type: "success"});
          res.redirect('/');
        });
      }
    }
    
    else if(/^(release\/.+)$/.test(dir)){
      if(req.user && req.user.rights === "admin"){
        gameHelper.releaseCreatureInstance(req.user, filename).then((user, creatureInstance) => {
          req.flash('notif', {content: "released: " + creatureInstance._id, type: "success"});
          res.redirect('/');
        });
      }
    }
    // catch all =====================================================================
    else {
      console.log(req.params[0]);
      let filename = path.parse(req.params[0]).name;
      res.preRender(root(req.params[0]), {notifs: req.flash('notif'), ...session}, function(err, html){
        if(err){
          console.log(err);
          render404(req, res);
        } else {
          res.send(html);
        }
      })
    }
    
    /**
      loginCheck redirects the user to the login page if they aren't logged in
    */
    function loginCheck(path, options){
      if(session.loggedIn){
        res.preRender(path, options);
      } else {
        req.flash('notif', {content: 'You must be logged in to access this page', type: "error"});
        res.redirect('/login');
      } 
    }
    
  });
  
  app.post('/updateemail', postHelper.updateEmail);
  
  app.post('/updatepassword', postHelper.updatePassword);
  
  app.post('/requestreset', postHelper.requestReset);
  
  app.post('/resetpassword', postHelper.resetPassword);
  
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/signup', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));
  
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));
  
  app.use(function(err, req, res, next){
    console.error(err);
    render404(req, res);
  });
  
  /**
    render404 runs when page requested wasn't found within any of the site's directories.
  */
  function render404(req, res){
    res.render(root('404'), {
      ...session,
      source: req.params[0] || 'this page',
      info:  JSON.parse(circularJSON.stringify({req: req, res: res}))
    })
  }

  function root(path){
    return "public/" + path;
  }
  
};

// save the entire function above to something express can use
module.exports = routes;