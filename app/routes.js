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

const serverHelper = require('../app/serverHelper');
const postHelper   = require('../app/postHelper');
const creatureHelper = require('../app/creatureHelper');
const mailer       = require('../app/mailer');
const formValidate = require('../public/shared/signupValidate');

//TODO: this has to be a reference, since user is stored in the req object. session object must be filled after request , making this variable useless besides for reference
//let session = {
//}

// offsetDate is the number of hours offset from GMT
// offsetDate should be PST (GMT-8) normally.
let offsetDate = -8;
let globalDate = Date.now() + (offsetDate*1000*60*60);
let date = moment.utc(globalDate);

console.log(date.format("hh:mm a"))

let letiables = {
  global: {
    message: '❤',
    title: "pawb.in",
    date: date.format("MMMM D YYYY"),
    time: date.format("hh:mm a"),
    nychthemericon: ""
  },
  help: {},
  login: {}
}

let session = {};

/**
 * express can identify and modify pages through calls made on "app"
 * The routes function is intended to store all of those calls
 */
function routes(app, passport){
  
  app.use(function(req, res, next) {
    session = {
      loggedIn: Boolean(req.user),
      user: req.user
    }
    next()
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
  
  app.get(/^\/(((?!\.).)*(?:.html)?)$/, function(req, res){
    //TODO: allow case insensitivity
    let dir = req.params[0].replace(/\/$/, ""),
        filename = req.path.replace(/\/$/, "").split('/').pop();
    
    //if logged in, extend session storage expiration date
    if(req.user){
      //console.log(req.session.cookie);
      req.session.cookie.maxAge = 10 * config.userSessionAge;
      req.session.cookie.expires = new Date(Date.now() + config.userSessionAge);
    }
    //console.log("user", req.user);
    
    // this (very important) string of ifs identifies the directory the user is trying to access
    if(dir === ''){
      req.flash('notif', {content: "you've done it!", type: 'success'});
      req.flash('notif', {content: "now you've done it...", type: 'error'});
      req.flash('notif', {content: "don't do it...", type: 'warn'});
      req.flash('notif', {content: "it has been done", type: 'info'});
      res.render('index', {notifs: req.flash('notif'), ...session});
    } 
    // HRLP ===================================================================
    else if(dir === 'help'){
      res.render('help', {message: ""})
    }
    // profile ===================================================================
    else if(dir === 'profile'){
      //console.log("user", req.user);
      res.render('profile', {notifs: req.flash('notif'), ...session, userdump: JSON.stringify(req.user)});
    }
    // signup ===================================================================
    else if(dir === 'signup'){
      res.render('signup', {notifs: req.flash('notif'), ...session});
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
      res.render('resetpassword', {notifs: req.flash('notif'), ...session});
    }
    // requestreset =================================================================
    else if(dir === 'requestreset'){
      res.render('requestreset', {notifs: req.flash('notif'), ...session});
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
    
    else if(dir === 'catch'){
      if(req.user){
        serverHelper.getUser(req.user).then(user => {
          if(user){
            creatureHelper.getCreature(1).then(creature => {
              user.creatures.push({creatureId: creature._id});
              user.save(function(err, saved){
                if(err){
                  console.log(err);
                } else {
                  console.log(user);
                }
              });
              res.redirect('/');
            });
          }
        })
      }
    }
    
    else if(dir === 'release'){
      if(req.user){
        serverHelper.getUser(req.user).then(user => {
          if(user){
            user.creatures.pop();
            user.save(function(err, saved){
              if(err){
                console.log(err);
              } else {
                console.log(user);
              }
            });
            res.redirect('/');
          }
        })
      }
    }
    // catch all =====================================================================
    else {
      console.log(req.params[0]);
      let filename = path.parse(req.params[0]).name;
      res.render(req.params[0], {...letiables[filename], ...session}, function(err, html){
        if(err){
          console.log(err);
          render404(req, res);
        } else {
          res.send(html);
        }
      })
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
   */
  function render404(req, res){
    res.render('404', {
      ...letiables["global"], 
      ...session,
      source: req.params[0] || 'this page',
      info:  circularJSON.stringify({req: req, res: res})
    })
  }
  
};

// save the entire function above to something express can use
module.exports = routes;