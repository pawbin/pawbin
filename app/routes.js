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
  app.get(/(.*)/, function(req, res){
    
    let dir = req.path.replace(/\/$/, "").slice(1),
        filename = dir.split('/').pop();
    //let filename = path.parse(req.params[0]).name;
    
    //if logged in, extend session storage expiration date
    if(req.user){
      //console.log(req.session.cookie);
      req.session._garbage = Date();
      req.session.touch();
      req.session.cookie.maxAge = 10 * config.userSessionAge;
      req.session.cookie.expires = new Date(Date.now() + config.userSessionAge);
      
      console.log(req.user);
      console.log(req.sessionID);
    }
    
    let _DEFAULT = Symbol('_DEFAULT');
    
    //==== URL LOOKUP TABLE ====
    let lookup = new Map([
      
      [_DEFAULT, o => {
        console.log("user accessed: ", req.params[0]);
        //let filename = path.parse(req.params[0]).name;
        res.preRender(root(stripUrl(dir)), {notifs: req.flash('notif'), ...session}, function(err, html){
          if(err){
            console.log(err);
            render404(req, res);
          } else {
            res.send(html);
          }
        });
      }],
      
      ['', o => {
        console.log("home");
        res.preRender(root('index'), {notifs: req.flash('notif'), ...session});
      }],
      
      ['help', o => {
        res.preRender(root('help'), {message: ""})
      }],
      
      // profile ===================================================================
      ['profile', o => {
        //console.log("user", req.user);
        loginCheck(root('profile'), {notifs: req.flash('notif'), ...session, userdump: req.user});
      }],
      
      // signup ====================================================================
      ['signup', o => {
        res.preRender(root('signup'), {notifs: req.flash('notif'), ...session});
      }],
      
      // verify/* ==================================================================
      [/^(verify\/.+)$/, o => {
        serverHelper.verifyEmail(filename).then(function(user){
          if(!req.session.passport){
            req.session.passport = {};
          }
          req.session.passport.user = user._id;
          res.redirect('/profile');
        }).catch(console.error);
      }],
      
      // resend verification =========================================
      ['resendverification', o => {
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
      }],
      
      // updateemail/* =================================================================
      [/^(updateemail\/.+)$/, o => {
        serverHelper.updateEmail(filename).then(function(user){
          res.redirect('/profile');
        }).catch(console.error);
      }],
      
      // resetpassword/* ==============================================================
      [/^(resetpassword\/.+)$/, o => {
        res.preRender(root('resetpassword'), {notifs: req.flash('notif'), ...session});
      }],
      
      // requestreset =================================================================
      ['requestreset', o => {
        res.preRender(root('requestreset'), {notifs: req.flash('notif'), ...session});
      }],
      
      // logout ===================================================================
      ['logout', o => {
        console.log("dsfgdf");
        if(req.user){
          req.session.cookie = {};
        }
        req.session.destroy(function() {
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
      }],
      
      // delete account ===================================================================
      ['deleteaccount', o => {
        if(req.user){
          serverHelper.deleteUser(req.user).then(user => {
            req.session.cookie = {};
            req.session.destroy(function() {
              res.clearCookie('connect.sid');
              //req.flash('notif', {content: "account deleted!", type: "success"});
              res.redirect('/');
            });
          });
        }
      }],
      
      ['catch', o => {
        if(req.user && req.user.rights === "admin"){
          gameHelper.catchCreatureInstance(req.user, "frizzbee").then((creatureInstance) => {
            req.flash('notif', {content: "caught: frizzbee", type: "success"});
            res.redirect('/');
          });
        }
      }],
      
      [/^(catch\/.+)$/, o => {
        if(req.user && req.user.rights === "admin"){
          gameHelper.catchCreatureInstance(req.user, filename).then((creatureInstance) => {
            creatureInstance.populate('creatureRef', (err, creatureInst) => {
              req.flash('notif', {content: "caught: " + creatureInst.creatureRef.name + " (" + creatureInst._id + ")", type: "success"});
              res.redirect('/creatures');
            });
          });
        }
      }],

      [/^(release\/.+)$/, o => {
        if(req.user && req.user.rights === "admin"){
          gameHelper.releaseCreatureInstance(req.user, filename).then((creatureInstance) => {
            creatureInstance.populate('creatureRef', (err, creatureInst) => {
              req.flash('notif', {content: "released: " + creatureInst.creatureRef.name + " (" + creatureInst._id + ")", type: "success"});
              res.redirect('/creatures');
            });
          });
        }
      }],
      
    ]); // END LOOKUP TABLE
    
    
    function get(url){
      if(lookup.has(stripUrl(url))){
        lookup.get(stripUrl(url))({type: 'direct', origin: url});
      } else {
        for(let [key, value] of lookup){
          if(typeof key === 'string' || typeof key === 'symbol'){
            continue;
          }
          if(key.test(url)){
            return lookup.get(key)({type: 'match', origin: url});
          }
        }
        lookup.get(_DEFAULT)({type: 'default', origin: url});
      }
    }
    
    // ========
    get(dir);
    // ========    
    
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
    
    function stripUrl(url){
      return url.toLowerCase().replace(/\.html$/, '');
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
      source: req.path.replace(/\/$/, "").slice(1) || 'this page',
      info:  JSON.parse(circularJSON.stringify({req: req, res: res}))
    })
  }

  function root(path){
    return "public/" + path;
  }

}


// save the entire function above to something express can use
module.exports = routes;

