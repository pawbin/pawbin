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
const postHelper   = require('../app/postHelper');
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
  index: {
    message: '❤',
    title: "pawb.in",
    date: date.format("MMMM D YYYY"),
    time: date.format("hh:mm a"),
    nychthemericon: ""
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
    console.log(((globalDate / (60 * 60 * 1000)) % 48));
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
    
    let session = {
      loggedIn: Boolean(req.user),
      user: req.user
    }
    
    // this (very important) string of ifs identifies the directory the user is trying to access
    if(dir === ''){
      res.render('index', {...letiables["index"], ...{session: session}});
    } 
    // HRLP ===================================================================
    else if(dir === 'help'){
      res.render('help', {message: ""})
    }
    // profile ===================================================================
    else if(dir === 'profile'){
      res.render('profile.html', { user: JSON.stringify(req.user), messages: JSON.stringify(req.flash('profileMessage')) });
    }
    // signup ===================================================================
    else if(dir === 'signup'){
      res.render('signup.html', { messages: req.flash('signupMessage') });
    }
    // verify/* ====================================================================
    else if(/(verify\/.+)$/.test(dir)){
      serverHelper.verifyEmail(filename).then(function(user){
        res.redirect('/profile');
      }).catch(console.error);
    }
    // updateemail/* =================================================================
    else if(/(updateemail\/.+)$/.test(dir)){
      serverHelper.updateEmail(filename).then(function(user){
        res.redirect('/profile');
      }).catch(console.error);
    }
    // resetpassword/* ==============================================================
    else if(/(resetpassword\/.+)$/.test(dir)){
      res.render('resetpassword.html', { messages: req.flash('resetpasswordMessage') });
    }
    // requestreset =================================================================
    else if(dir === 'requestreset'){
      res.render('requestreset.html', { messages: req.flash('requestresetMessage') });
    } 
    // catch all =====================================================================
    else {
      console.log(req.params[0]);
      let filename = path.parse(req.params[0]).name;
      res.render(req.params[0], {...letiables[filename], ...{session: session}}, function(err, html){
        if(err){
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