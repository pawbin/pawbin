const mongoose   = require('mongoose');
const User       = require('../app/models/user');
const TempUser   = require('../app/models/tempUser');
const mailer     = require('../app/mailer');
const randtoken  = require('rand-token');

let helper = {};

/**
 * Gets a user from the database
 * @param {string|Object} username, email, id, or user object.
 *   @param {string} user.username
 *   @param {string} user.email
 *   @param {string} user.local.username
 *   @param {string} user.local.email
 * @returns {Promise} User
 */
helper.getUser = function(data){
  return new Promise(function(resolve, reject){
    if(!data){
      return reject("getUser: no data");
    }
    if(data instanceof User){
      return resolve(data);
    }
    if(typeof data === 'string'){
      if(/\S+@\S+\.\S+/.test(data)){ //email
        User.findOne({'local.email': data}, function(err, user) {
          if(err){
            return reject(err);
          }
          if(user){
            return resolve(user);
          } else {
            return reject("getUser: wrong email");
          }
        });
      } else if(mongoose.Types.ObjectId.isValid(data)) { //id
        User.findById(data, function(err, user) {
          if(err){
            return reject(err);
          }
          if(user){
            return resolve(user);
          } else {
            return reject("getUser: wrong id");
          }
        });
      } else { //username (probably)
        User.findOne({'local.username': data}, function(err, user) {
          if(err){
            return reject(err);
          }
          if(user){
            return resolve(user);
          } else {
            return reject("getUser: wrong username");
          }
        });
      }
    } else { //object
      if(data.username || (data.local && data.local.username)){
        User.findOne({'local.username': data.username || data.local.username}, function(err, user) {
          if(err){
            return reject(err);
          }
          if(user){
            return resolve(user);
          } else {
            return reject("getUser: wrong username");
          }
        });
      } else if(data.email || (data.local && data.local.email)){
        User.findOne({'local.email': data.email || data.local.email}, function(err, user) {
          if(err){
            return reject(err);
          }
          if(user){
            return resolve(user);
          } else {
            return reject("getUser: wrong email");
          }
        });
      } else {
        return reject("getUser: no suitable data");
      }
    }
  });
}


/**
 * Gets a user from the database
 * @param {string|Object} username, email, or user object.
 *   @param {string} user.username
 *   @param {string} user.email
 * @returns {Promise} User
 */
helper.getTempUser = function(data){
  return new Promise(function(resolve, reject){
    if(typeof data === 'string'){
      if(/\S+@\S+\.\S+/.test(data)){ //email
        TempUser.findOne({'local.email': data}, function(err, user) {
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
        TempUser.findOne({'local.username': data}, function(err, user) {
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
      if(data.username || (data.local && data.local.username)){
        TempUser.findOne({'local.username': data.username || data.local.username}, function(err, user) {
          if(err){
            reject(err);
          }
          if(user){
            resolve(user);
          } else {
            reject("none found");
          }
        });
      } else if(data.email || (data.local && data.local.email)){
        TempUser.findOne({'local.email': data.email || data.local.email}, function(err, user) {
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