const serverHelper = require('../site/serverHelper.js');
const userHelper   = require('../site/userHelper.js');
const mailer       = require('../site/mailer.js');
const formValidate = require('../../static/shared/signupValidate.js');
const avatarValidate = require('../../static/shared/avatarValidate.js');
const path   = require('path');


let helper = {};

/**
 * handles the updateemail form
 * @param {Object} req
 * @param {Object} res
 */
helper.updateEmail = function(req, res){
  let newEmail = req.body.newEmail;
  let password = req.body.password;
  
  let validated = formValidate({email: newEmail}, {email: true});
  if(validated !== true){
    req.flash('notif', {form: path.parse(req.path).name, ...validated});
    res.redirect(req.get('referer'));
    return;
  }
  
  userHelper.getUser(req.user).then(user => {
    if(user.checkPassword(password)){
      serverHelper.sendUpdateEmailVerification(user, newEmail).then(console.log).catch(console.error);
      req.flash('notif', {form: path.parse(req.path).name, content: 'Confirmation email sent to ' + newEmail, type: 'success'});
      res.redirect(req.get('referer'));
    } else {
      req.flash('notif', {form: path.parse(req.path).name, content: 'Incorrect Password', type: 'error'});
      res.redirect(req.get('referer'));
    }
  }).catch(console.error);
}

/**
 * handles the updatepassword form
 * @param {Object} req
 * @param {Object} res
 */
helper.updatePassword = function(req, res){
  //TODO: separate file including User model
  let password = req.body.password;
  let newPassword = req.body.newPassword;
  let confirmNewPassword = req.body.confirmNewPassword;
  
  console.log(req)
  
  let validated = formValidate({password: newPassword, confirmPassword: confirmNewPassword}, {password: true, confirmPassword: true});
  if(validated !== true){
    req.flash('notif', {form: path.parse(req.path).name, ...validated});
    res.redirect(req.get('referer'));
    return;
  }
  //this is the only postHelper function that needs to (is able to) modify the user directly. all the other ones currently need a token verification, so will be run through serverHelper first
  userHelper.getUser(req.user).then(user => {
    if(user.checkPassword(password)){
      
      user.local.password = user.generateHash(newPassword);
      user.save(function(err, savedUser) {
        if (err) {
          console.error("save", err);
        } else {
          mailer.sendUpdatePasswordNotification(user.local.email, function(err, info){
            if(err){
              console.error(err)
            }
          });
        }
      });
      
      req.flash('notif', {form: path.parse(req.path).name, content: 'Password successfully updated. Notification email sent to ' + user.local.email, type: 'success'});
      res.redirect(req.get('referer'));
    } else {
      req.flash('notif', {form: path.parse(req.path).name, content: 'Incorrect Password', type: 'error'});
      res.redirect(req.get('referer'));
    }
  }).catch(console.error);
}

/**
 * handles the requestreset form
 * @param {Object} req
 * @param {Object} res
 */ 
helper.requestReset = function(req, res){
  let email = req.body.email;
  //verification isn't necessary because if it finds a user with that email it couldn't have been added without verification
  userHelper.getUser({email: email}).then(user => {
    if(user){
      serverHelper.sendResetPasswordVerification(user).then(console.log).catch(console.error);
      req.flash('notif', {form: path.parse(req.path).name, content: 'Confirmation email sent to ' + user.local.email, type: 'success'});
      res.redirect(req.get('referer'));
    } else {
      req.flash('notif', {form: path.parse(req.path).name, content: 'No user has that email', type: 'error'});
      res.redirect(req.get('referer'));
    }
  }).catch(console.error);
}

/**
 * handles the resetpassword form
 * @param {Object} req
 * @param {Object} res
 */
helper.resetPassword = function(req, res){
  let newPassword = req.body.password;
  let confirmNewPassword = req.body.confirmPassword;
  //TODO: .generateHash(password);
  //DONT pass plaintext password around, generate hash before passing to serverHelper
  let validated = formValidate({password: newPassword, confirmPassword: confirmNewPassword}, {password: true, confirmPassword: true});
  if(validated !== true){
    req.flash('notif', {form: path.parse(req.path).name, ...validated});
    res.redirect(req.get('referer'));
    return;
  }
  let token = req.get('referer').replace(/\/$/, "").split('/').pop();
  serverHelper.resetPassword(token, newPassword).then(user => {
    req.flash('notif', {form: path.parse(req.path).name, content: 'Password successfully reset', type: 'success'});
    res.redirect('/');
  }).catch(console.error);
}

/**
 * handles the updateavatar form
 * @param {Object} req
 * @param {Object} res
 */
helper.updateAvatar = function(req, res){
  console.log(req.file, req.files, req.body)
  let mimetype = req.file.mimetype,
      filePath = '/' + req.file.path.replace('static/', '');
      //encoded = req.file.buffer.toString('base64'),
      //base64uri = `data:${mimetype};base64,${encoded}`;
  
  let validated = avatarValidate({avatar: req.file});
  if(validated !== true){
    req.flash('notif', {form: path.parse(req.path).name, ...validated});
    res.redirect(req.get('referer'));
    return;
  }
  
  req.user.set({avatar: filePath});
  req.user.save((err, saved) => {
    if(err){
      req.flash('notif', {form: path.parse(req.path).name, content: 'Cannot save that image', type: 'error'});
    } else {
      req.flash('notif', {form: path.parse(req.path).name, content: 'Avatar changed successfully', type: 'success'});
    }
    res.redirect(req.get('referer'));
  });
}

/**
 * handles the updateNickname form
 * @param {Object} req
 * @param {Object} res
 */
helper.updateNickname = function(req, res){
  let validated = formValidate({nickname: req.body.newNickname}, {nickname: true});
  if(validated !== true){
    req.flash('notif', {form: path.parse(req.path).name, ...validated});
    res.redirect(req.get('referer'));
    return;
  }
  
  req.user.set('local.nickname', req.body.newNickname);
  req.user.save((err, saved) => {
    if(err){
      req.flash('notif', {form: path.parse(req.path).name, content: 'Error saving nickname', type: 'error'});
    } else {
      req.flash('notif', {form: path.parse(req.path).name, content: 'Nickname changed successfully', type: 'success'});
    }
    res.redirect(req.get('referer'));
  });
}

module.exports = helper;