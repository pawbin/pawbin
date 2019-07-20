const LocalStrategy = require('passport-local').Strategy;

const User     = require('../app/models/user');
const TempUser = require('../app/models/tempUser');
const mailer   = require('../app/mailer');

const randtoken   = require('rand-token');
const querystring = require('querystring');

let signupValidate = require('../static/shared/signupValidate.js');

module.exports = function(passport) {
  
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session
  
  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
  
  //SIGNUP
  passport.use('local-signup', new LocalStrategy({
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  }, function(req, username, password, done) {
    let email = req.body.email,
        nickname = req.body.nickname,
        confirm = req.body.confirm
    username = username.trim();
    if(/\s*/.test(nickname)){
      nickname = username;
    }
    nickname = nickname.trim();
    // User.findOne wont fire unless data is sent back (copied from another guide, i'm not sure why this is necessary)
    process.nextTick(function() {
      let validated = signupValidate(req.body);
      if(validated !== true){
        return done(null, false, req.flash('notif', (validated)));
      }
      // check existing user
      User.findOne({$or: [{ 'local.username' :  username }, { 'local.email' :  email }]}, function(err, user) {
        if(err){
          return done(err);
        }
        // user already exists, show error
        if (user) {
          //is username or email (or both?) taken?
          if(user.local.username == username && user.local.email == email){
            return done(null, false, req.flash('notif', {content: 'That email and username is already taken.', type: 'error'}));
          } else if(user.local.username == username){
            return done(null, false, req.flash('notif', {content: 'That username is already taken.', type: 'error'}));
          } else if(user.local.email == email){
            return done(null, false, req.flash('notif', {content: 'That email is already taken.', type: 'error'}));
          }
          //just in case
          return done(null, false, req.flash('notif', {content: 'That user is already taken.', type: 'error'}));
        }
        // check existing unverified user
        TempUser.findOne({'local.username': username, 'local.email': email }, function(err, user) {
          if(err){
            return done(null, false, req.flash('notif', {content: 'Something went wrong (tempUser find)', type: 'error'}));
          }
          // temp user exists
          if(user){
            return done(null, false, req.flash('notif', {content: 'This account needs to be verified. would you like to <a href="' + "/resendverification?" + querystring.stringify({email: email}) + '" class="resendVerification">resend verification email</a>?', type: "info"}));
          }
          let token = randtoken.generate(10);
          // create tempUser for storage before verification
          let newTempUser = new TempUser();
          newTempUser.local          = {email, username, nickname};
          newTempUser.local.password = newTempUser.generateHash(password);
          newTempUser.verifyURL      = token;
          newTempUser.rights         = "user";
          newTempUser.save(function(err, savedUser) {
            if(err){
              return done(null, false, req.flash('notif', {content: 'Something went wrong (tempUser save)', type: 'error'}));
            }
            mailer.sendVerifyEmail(email, token, function(err, info) {
              if(err){
                // remove created tempUser on error (maybe should be different?)
                newTempUser.remove(function (err, tempUser) {
                  if (err) {
                    return done(null, false, req.flash('notif', {content: 'Something went wrong (tempUser delete verify fail)', type: 'error'}));
                  }
                  return done(null, false, req.flash('notif', {content: 'Something went wrong (verify email fail)', type: 'error'}));
                });
              }
              return done(null, savedUser, req.flash('notif', {content: 'A verification email was sent to ' + email, type: "success"}));
            });
          });
        });
      });
    });
  }));
  
  //LOGIN
  passport.use('local-login', new LocalStrategy({
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  }, function(req, username, password, done) {
    console.log('s');
    // can login with either username or email, both sent through the 'username' param
    User.findOne({$or: [{ 'local.username' :  username }, { 'local.email' :  username }]}, function(err, user) {
      console.log("::login attempt", user);
      if(err){
        console.error("::login error:", err);
        return done(err);
      }
      if(!user){
        console.error("::wrong username");
        return done(null, false, req.flash('notif', {content: 'no user found', type: 'error'}));
      }
      if(!user.checkPassword(password)){
        console.error("::wrong password");
        return done(null, false, req.flash('notif', {content: 'wrong password', type: 'error'})); 
      }
      console.log("::login success");
      return done(null, user);
    });
  }));
}