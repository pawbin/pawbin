const User       = require('../app/models/user'),
      mongoose   = require('mongoose'),
      bcrypt     = require('bcrypt'),
      nodemailer = require('nodemailer');

const fill = require('../app/fill');

let mailer = {};

let options = {
  host: 'server137.web-hosting.com',
  port: 465,
  secure: true, // secure:true for port 465, secure:false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
}

let template = {};

template.verifyEmail = {
  url: 'https://pawbin.glitch.me/verify/${TOKEN}',
  from: 'pawbin Do Not Reply <pawbin@torcado.com>',
  subject: 'Please confirm account',
  html: '<p>Click the following link to confirm your account: <a href="${URL}">${URL}</a></p>',
  text: 'Please confirm your account by accessing the following link: ${URL}'
}

template.updateEmail = {
  url: 'https://pawbin.glitch.me/updateemail/${TOKEN}',
  from: 'pawbin Do Not Reply <pawbin@torcado.com>',
  subject: 'Please confirm email update',
  html: '<p>Someone (hopefully you) requested your account email to be updated to this one. \nTo confirm this, please click the following link: <a href="${URL}">${URL}</a></p>',
  text: 'Someone (hopefully you) requested your account email to be updated to this one. \nTo confirm this, please access the following link: ${URL}'
}

template.updateEmailNotification = {
  from: 'pawbin Do Not Reply <pawbin@torcado.com>',
  subject: 'Email Update Notification',
  html: '<p>Someone (hopefully you) requested your account email to be updated to {NEWEMAIL}. If you are the owner of this account,</p>',
  text: 'Someone (hopefully you) requested your account email to be updated to this one. \nTo confirm this, please access the following link: ${URL}'
}

template.updatePasswordNotification = {
  from: 'pawbin Do Not Reply <pawbin@torcado.com>',
  subject: 'Password update notification',
  html: '<p>Your password has been changed</p>',
  text: 'Your password has been changed'
}

template.resetPassword = {
  url: 'https://pawbin.glitch.me/resetpassword/${TOKEN}',
  from: 'pawbin Do Not Reply <pawbin@torcado.com>',
  subject: 'Password reset request',
  html: '<p>A password reset for this account has been requested. To continue, please click the following link: <a href="${URL}">${URL}</a></p>',
  text: 'A password reset for this account has been requested. To continue, please access the following link: ${URL}'
}

let transporter = nodemailer.createTransport(options);

mailer.send = transporter.sendMail; //may end up changing this into a more customized function

mailer.sendVerifyEmail = function(email, token, callback){
  
  let url = fill(template.verifyEmail.url, {TOKEN: token});
  
  let message = {};
  
  message.to = email;
  message.from = template.verifyEmail.from;
  message.subject = template.verifyEmail.subject;
  message.text = fill(template.verifyEmail.text, {URL: url});
  message.html = fill(template.verifyEmail.html, {URL: url});
  
  transporter.sendMail(message, callback);

}

mailer.sendUpdateEmail = function(email, token, callback){
  
  let url = fill(template.updateEmail.url, {TOKEN: token});
  
  let message = {};
  
  message.to = email;
  message.from = template.updateEmail.from;
  message.subject = template.updateEmail.subject;
  message.text = fill(template.updateEmail.text, {URL: url});
  message.html = fill(template.updateEmail.html, {URL: url});

  transporter.sendMail(message, callback);
  
}

mailer.sendUpdatePasswordNotification = function(email, callback){
  
  let message = {};
  
  message.to = email;
  message.from = template.updatePasswordNotification.from;
  message.subject = template.updatePasswordNotification.subject;
  message.text = template.updatePasswordNotification.text;
  message.html = template.updatePasswordNotification.html;

  transporter.sendMail(message, callback);
  
}

mailer.sendResetPassword = function(email, token, callback){
  
  let url = fill(template.resetPassword.url, {TOKEN: token});
  
  let message = {};
  
  message.to = email;
  message.from = template.resetPassword.from;
  message.subject = template.resetPassword.subject;
  message.text = fill(template.resetPassword.text, {URL: url});
  message.html = fill(template.resetPassword.html, {URL: url});

  transporter.sendMail(message, callback);
  
}

module.exports = mailer;