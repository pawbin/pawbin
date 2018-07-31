
// passport strategy (I need to learn more about what this is)
const LocalStrategy   = require('passport-local').Strategy;

// mongo user model
const User            = require('../app/models/user');
const TempUser        = require('../app/models/tempuser');

const randtoken       = require('rand-token');

const mailer          = require('../app/mailer');

const querystring     = require('querystring');

//custom validation
let signupValidate = require('../public/shared/signupValidate');

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
  },
  function(req, username, password, done) {
    
    console.log("signup user", username);

    let email = req.body.email,
        nickname = req.body.nickname,
        confirm = req.body.confirm
    
    username.trim(); //trim whitespace
    
    //set nickname to username if empty
    if(/\s*/.test(nickname)){
      nickname = username;
    }
    nickname.trim(); //trim whitespace

    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function() {
      
      
      let validated = signupValidate(req.body);
      
      if(validated === true){
        
      } else {
        return done(null, false, req.flash('notif', (validated)));
      }

      User.findOne({$or: [{ 'local.username' :  username }, { 'local.email' :  email }]}, function(err, user) {
        // if there are any errors, return the error
        if (err)
          return done(err);

        // user already exists, show error
        if (user) {
          //is username or email (or both?) taken?
          if(user.local.username == username && user.local.email == email){
            return done(null, false, req.flash('notif', {content: 'That email and username is already taken.', type: 'error'}));
          } else if(user.local.username == username){
            return done(null, false, req.flash('notif', {content: 'That username is already taken.', type: 'error'}));
          } else if(user.local.email == email){
            return done(null, false, req.flash('notif', {content: 'That email is already taken.', type: 'error'}));
          } else { //just in case
            return done(null, false, req.flash('notif', {content: 'That user is already taken.', type: 'error'}));
          }
        } else {

          TempUser.findOne({'local.username': username, 'local.email': email }, function(err, user) {
            if(err){
              console.log(err);
              return done(null, false, req.flash('notif', {content: 'Something went wrong!', type: 'error'}));
            }

            //user exists
            if(user){
              return done(null, false, req.flash('notif', {content: 'This account needs to be verified. would you like to <a href="' + "/resendverification?" + querystring.stringify({email: email}) + '" class="resendVerification">resend verification email</a>?', type: "info"}));
            } else {
              
              //teecchnically can be identical to an existing token in tempusers but what are the chances
              let token = randtoken.generate(10);
              
              let newTempUser = new TempUser();

              newTempUser.local.email    = email;
              newTempUser.local.username = username;
              newTempUser.local.nickname = nickname;
              newTempUser.local.password = newTempUser.generateHash(password);
              newTempUser.verifyURL      = token;
              newTempUser.rights         = "user";
              newTempUser.save(function(err, savedUser) {
                if (err) { //database error
                  console.log(err);
                  return done(null, false, req.flash('notif', {content: 'Something went wrong', type: 'error'}));
                }
                mailer.sendVerifyEmail(email, token, function(err, info) {
                  if (err){
                    console.log(err);
                    newTempUser.remove(function (err, tempUser) {
                      if (err) { //deletion error
                        console.log(err);
                        return done(null, false, req.flash('notif', {content: 'Something went wrong', type: 'error'}));
                      }
                    });
                    return done(null, false, req.flash('notif', {content: 'Something went wrong', type: 'error'}));
                  } else {
                    return done(null, savedUser, req.flash('notif', {content: 'A verification email was sent to ' + email, type: "success"}));
                  }
                });
              });
            }
          }); 
        }
      });
    });
  }));

  //LOGIN
  passport.use('local-login', new LocalStrategy({
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, username, password, done) { 
    
    User.findOne({$or: [{ 'local.username' :  username }, { 'local.email' :  username }]}, function(err, user) {
      // if there are any errors, return the error before anything else
      console.log("login user", user);
      if(err){
        console.error(err);
        return done(err);
      }

      // if no user is found, return the message
      if(!user){
        return done(null, false, req.flash('notif', {content: 'no user found', type: 'error'})); // req.flash is the way to set flashdata using connect-flash
      }

      // if the user is found but the password is wrong
      if(!user.validPassword(password)){
        return done(null, false, req.flash('notif', {content: 'wrong password', type: 'error'})); // create the loginMessage and save it to session as flashdata
      }

      // all is well, return successful user
      return done(null, user);
    });
  }));
};