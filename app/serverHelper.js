const mongoose   = require('mongoose'),
      bcrypt     = require('bcrypt'),
      nodemailer = require('nodemailer'),
      randtoken  = require('rand-token');

const User       = require('../app/models/user');
const TempUser   = require('../app/models/tempuser');
const mailer     = require('../app/mailer');

var helper = {};

/**
 * Gets a user from the database
 * @param {string|Object} username, email, or user object.
 *   @param {string} user.username
 *   @param {string} user.email
 * @returns {Promise} User
 */
helper.getUser = function(data){
  return new Promise(function(resolve, reject){
    if(typeof data === 'string'){
      if(/\S+@\S+\.\S+/.test(data)){ //email
        User.findOne({'local.email': data}, function(err, user) {
          if(err){
            reject(err);
          }
          if(user){
            resolve(user);
          } else {
            reject("none found");
          }
        });
      } else { //username (probably)
        User.findOne({'local.username': data}, function(err, user) {
          if(err){
            reject(err);
          }
          if(user){
            resolve(user);
          } else {
            reject("none found");
          }
        });
      }
    } else {
      if(data.username || data.local.username){
        User.findOne({'local.username': data.username || data.local.username}, function(err, user) {
          if(err){
            reject(err);
          }
          if(user){
            resolve(user);
          } else {
            reject("none found");
          }
        });
      } else if(data.email || data.local.email){
        User.findOne({'local.email': data.email || data.local.email}, function(err, user) {
          if(err){
            reject(err);
          }
          if(user){
            resolve(user);
          } else {
            reject("none found");
          }
        });
      } else {
        reject("no suitable data");
      }
    }
  });
}


/**
 * Send verification email for an email address update
 * @param {Object} user - user to send email to
 * @param {String} newEmail - the new email to replace the old email
 * @returns {Promise}
 */
helper.sendUpdateEmail = function(user, newEmail){
  return new Promise(function(resolve, reject){
    var token = randtoken.generate(10);
    
    user.updateEmail.verifyURL = token;
    user.updateEmail.newEmail  = newEmail;
    user.updateEmail.createdAt = Date.now();
    
    user.save(function(err, saved){
      if(err){
        console.log(err);
      }
      if(saved){
        console.log(saved);
        mailer.sendUpdate(newEmail, token, function(err, info) {
          if (err){
            console.log(err);
            user.updateEmail = {}; //there was an error, clear information
            user.save(function(err, saved){
              if(err){
                console.log(err);
              }
            });
            reject(err);
          } else {
            resolve(true);
          }
        });
      }
    });
  });
}


/**
 * Verifies email for a user, moving them from the TempUser collection into the User collection
 * @param {string} token - token from url string
 * @returns {Promise} User
 */
helper.verifyEmail = function(token){
  return new Promise(function(resolve, reject){
    TempUser.findOne({'verifyURL': token}, function(err, tempUser) {
      if(err){
        reject(err);
      }

      if(tempUser){
        var userData = {},
            user;

        var tempUserObject = tempUser.toObject();

        for (var property in tempUser) userData[property] = tempUserObject[property];

        // delete userData['verifyURL'];
        // delete userData['_id'];
        userData['verifyURL'] = undefined;
        userData['_id'] = undefined;
        user = new User({'local': userData.local}); //???? i don't understand this. new User(userData) doesn't work.
        //user = new User(userData); 

        console.log("--user--");
        console.log(user);
        console.log(user.local.username);

        // save the temporary user to the persistent user collection
        user.save(function(err, savedUser) {
          if (err) {
            console.log("save", err);
            reject(err);
          }
          //delete the old temp user
          TempUser.remove({'verifyURL': token}, function(err) {
            if (err) {
              reject(err);
            }

            resolve(user);
          });
        });
      } else {
        reject("none found");
      }
    });
  });
}

/**
 * Updates email for a user
 * @param {string} token - token from url string
 * @returns {Promise} User
 */
helper.updateEmail = function(token){
  return new Promise(function(resolve, reject){
    User.findOne({'updateEmail.verifyURL': token}, function(err, user) {
      if(err){
        reject(err);
      }

      if(user){
        user.local.email = user.updateEmail.newEmail
        user.updateEmail = {}; //clear old information

        // save the new password
        user.save(function(err, savedUser) {
          if (err) {
            console.log("save", err);
            reject(err);
          } else {
            resolve(savedUser);
          }
        });
      } else {
        reject("none found");
      }
    });
  });
}

/**
 * Send password reset email after requesting it
 * @param {Object} user
 * @returns {Promise}
 */
helper.sendPasswordResetEmail = function(user){
  return new Promise(function(resolve, reject){
    let token = randtoken.generate(10);
    
    user.resetPassword.verifyURL = token;
    user.resetPassword.createdAt = Date.now();
    
    user.save(function(err, saved){
      if(err){
        console.log(err);
      }
      if(saved){
        console.log(saved);
        mailer.sendPasswordReset(user.local.email, token, function(err, info) {
          if (err){
            console.log(err);
            user.resetPassword = {}; //there was an error, clear information
            user.save(function(err, saved){
              if(err){
                console.log(err);
              }
            });
            reject(err);
          } else {
            resolve(true);
          }
        });
      }
    });
  });
}

/**
 * Resets a user's password
 * @param {string} token - token from url string
 * @param {string} newPassword - new password hash
 * @returns {Promise} User
 */
helper.resetPassword = function(token, newPassword){
  return new Promise(function(resolve, reject){
    User.findOne({'resetPassword.verifyURL': token}, function(err, user) {
      if(err){
        reject(err);
      }

      if(user){
        user.local.password = user.generateHash(newPassword);
        user.resetPassword = {}; //clear information

        // save the new password
        user.save(function(err, savedUser) {
          if (err) {
            console.log("save", err);
            reject(err);
          } else {
            resolve(savedUser);
          }
        });
      } else {
        reject("none found");
      }
    });
  });
}

module.exports = helper;