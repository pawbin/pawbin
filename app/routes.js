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
const moment = require('moment');

const serverHelper = require('../app/serverHelper');
const mailer       = require('../app/mailer');

var formValidate = require('../public/shared/signupValidate');

//TODO: this has to be a reference, since user is stored in the req object. session object must be filled after request , making this variable useless besides for reference
//var session = {
//}

// offsetDate is the number of hours offset from GMT
// offsetDate should be PST (GMT-8) normally.
var offsetDate = -8;
var globalDate = Date.now() + (offsetDate*1000*60*60);
var date = moment.utc(globalDate);

var variables = {
  index: {
    message: '❤',
    title: "pawb.in",
    date: date.format("MMMM D YYYY"),
    time: date.format("hh:MM A")
  },
  help: {},
  login: {}
}

/**
 * express can identify and modify pages through calls made on "app"
 * The routes function is intended to store all of those calls
 */
function routes(app, passport){

  // identify the 404 directory 
  app.get('/404', function(req, res){
    render404(req, res);
  });
  
  // nychthemericon -- day/night icon based on UTC time
  app.get(/^\/nychthemericon(.png|.svg|.jpe?g|.gif)?$/, function(req, res){
    console.log("n");
    if(((Date.now() / (60 * 60 * 1000)) % 48) < 24){
      request('https://cdn.glitch.com/5dce4cb1-f48b-44b6-92cc-e338cf68eb7f%2Fsun.svg').pipe(res);
    } else {
      request('https://cdn.glitch.com/5dce4cb1-f48b-44b6-92cc-e338cf68eb7f%2Fmoon.svg').pipe(res);
    }
  });
  
  app.get(/^\/(((?!\.).)*(?:.html)?)$/, function(req, res){
    //TODO: allow case insensitivity
    var dir = req.params[0].replace(/\/$/, ""),
        filename = req.path.replace(/\/$/, "").split('/').pop();
    
    var session = {
      loggedIn: Boolean(req.user),
      user: req.user
    }
    
    // this (very important) string of ifs identifies the directory the user is trying to access
    if(dir === ''){
      res.render('index', {...variables["index"], ...{session: session}});
    } else if(dir === 'help'){
      res.render('help', {message: ""})
    } else if(dir === 'profile'){
      res.render('profile.html', { user: JSON.stringify(req.user), messages: JSON.stringify(req.flash('profileMessage')) });
    } else if(dir === 'signup'){
      res.render('signup.html', { messages: req.flash('signupMessage') });
    } else if(/(verify\/.+)$/.test(dir)){
      serverHelper.verifyEmail(filename).then(function(user){
        res.redirect('/profile');
      }).catch(console.error);
    } else if(/(update\/.+)$/.test(dir)){
      serverHelper.updateEmail(filename).then(function(user){
        res.redirect('/profile');
      }).catch(console.error);
    } else if(/(passwordreset\/.+)$/.test(dir)){
      res.render('passwordreset.html', { messages: req.flash('passwordresetMessage') });
    } else if(dir === 'requestreset'){
      res.render('requestreset.html', { messages: req.flash('requestresetMessage') });
    } else {
      console.log(req.params[0]);
      var filename = path.parse(req.params[0]).name;
      res.render(req.params[0], {...variables[filename], ...{session: session}}, function(err, html){
        if(err){
          render404(req, res);
        } else {
          res.send(html);
        }
      })
    }
  });
  
  app.post('/updateemail', function(req, res){
    //TODO: separate file including User model
    //TODO: maybe verify email here
    var newEmail = req.body.newEmail;
    var password = req.body.password;
    serverHelper.getUser(req.user).then(user => {
      if(user.validPassword(password)){
        serverHelper.sendUpdateEmail(user, newEmail).then(console.log).catch(console.error);
        req.flash('profileMessage', {content: 'Confirmation email sent to ' + newEmail, type: 'success'});
      } else {
        req.flash('profileMessage', {content: 'Incorrect Password', type: 'error'});
      }
      res.redirect("/profile");
    }).catch(console.error);
  });
  
  app.post('/updatepassword', function(req, res){
    //TODO: separate file including User model
    var password = req.body.password;
    var validated = formValidate({password: req.body.newPassword, confirmPassword: req.body.confirmNewPassword}, {password: true, confirmPassword: true});
    if(validated !== true){
      req.flash('profileMessage', (validated));
      return;
    }
    serverHelper.getUser(req.user).then(user => {
      if(user.validPassword(password)){
        mailer.sendPasswordUpdate(user.local.email, function(err, info){
          if(err){
            console.error(err)
          }
        });
        req.flash('profileMessage', {content: 'Confirmation email sent to ' + user.local.email, type: 'success'});
      } else {
        req.flash('profileMessage', {content: 'Incorrect Password', type: 'error'});
      }
      res.redirect("/profile");
    }).catch(console.error);
  });
  
  app.post('/requestreset', function(req, res){
    var email = req.body.email;
    //verification isn't necessary because if it finds a user with that email it couldn't have been added without verification
    serverHelper.getUser({email: email}).then(user => {
      if(user){
        serverHelper.sendPasswordResetEmail(user).then(console.log).catch(console.error);
      } else {
        req.flash('requestresetMessage', {content: 'No user has that email', type: 'error'});
      }
    }).catch(console.error);
  });
  
  app.post('/resetpassword', function(req, res){
    var newPassword = req.body.password;
    //TODO: .generateHash(password);
    //DONT pass plaintext password around, generate hash before passing to serverHelper
    var validated = formValidate({password: req.body.password, confirmPassword: req.body.confirmPassword}, {password: true, confirmPassword: true});
    if(validated !== true){
      req.flash('passwordresetMessage', (validated));
      return;
    }
    var token = req.path.replace(/\/$/, "").split('/').pop();
    serverHelper.resetPassword(token, newPassword).then(user => {
      req.flash('passwordresetMessage', {content: 'Password successfully reset', type: 'success'});
    }).catch(console.error);
  });
  
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
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
      source: req.params[0] || 'this page',
      info:  circularJSON.stringify({req: req, res: res})
    })
  }
  
};

// save the entire function above to something express can use
module.exports = routes;