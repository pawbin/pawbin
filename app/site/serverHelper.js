const mongoose   = require('mongoose');
const User       = require('../models/user.js');
const TempUser   = require('../models/tempUser.js');
const mailer     = require('../site/mailer.js');
const randtoken  = require('rand-token');

let helper = {};

/**
 * Verifies email for a user, moving them from the TempUser collection into the User collection
 * @param {string} token - token from url string
 * @returns {Promise} User
 */
helper.verifyEmail = function(token){
  return new Promise(function(resolve, reject){
    TempUser.findOne({'verifyURL': token}, function(err, tempUser) {
      if(err){
        return reject(err);
      }
      if(!tempUser){
        return reject("no tempUser found");
      }
      let user = new User({'local': tempUser.local}); 
      // save the temporary user to the persistent user collection
      user.save(function(err, savedUser) {
        if (err) {
          return reject(err);
        }
        //delete the old temp user
        TempUser.remove({'verifyURL': token}, function(err) {
          if (err) {
            return reject(err);
          }
          return resolve(user);
        });
      });
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
 * Send password reset verification email after requesting it
 * @param {Object} user
 * @returns {Promise}
 */
helper.sendResetPasswordVerification = function(user){
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
        mailer.sendResetPassword(user.local.email, token, function(err, info) {
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

/**
 * Send verification email for an email address update
 * @param {Object} user - user to send email to
 * @param {String} newEmail - the new email to replace the old email
 * @returns {Promise}
 */
helper.sendUpdateEmailVerification = function(user, newEmail){
  return new Promise(function(resolve, reject){
    let token = randtoken.generate(10);
    
    user.updateEmail.verifyURL = token;
    user.updateEmail.newEmail  = newEmail;
    user.updateEmail.createdAt = Date.now();
    
    user.save(function(err, saved){
      if(err){
        console.log(err);
      }
      if(saved){
        console.log(saved);
        mailer.sendUpdateEmail(newEmail, token, function(err, info) {
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

module.exports = helper;