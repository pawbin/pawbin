const User       = require('../app/models/user'),
      mongoose   = require('mongoose'),
      bcrypt     = require('bcrypt'),
      nodemailer = require('nodemailer');

const fill = require('../app/fill');

var mailer = {};

var options = {
  host: 'server137.web-hosting.com',
  port: 465,
  secure: true, // secure:true for port 465, secure:false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
}

var template = {};

template.verify = {
  url: 'https://spoopy-proj-v2.glitch.me/verify/${TOKEN}',
  from: 'spoopyproj Do Not Reply <spoopy@torcado.com>',
  subject: 'Please confirm account',
  html: '<p>Click the following link to confirm your account: <a href="${URL}">${URL}</a></p>',
  text: 'Please confirm your account by accessing the following link: ${URL}'
}

template.update = {
  url: 'https://spoopy-proj-v2.glitch.me/update/${TOKEN}',
  from: 'spoopyproj Do Not Reply <spoopy@torcado.com>',
  subject: 'Please confirm email update',
  html: '<p>Someone (hopefully you) requested their account email to be updated to this one. \nTo confirm this, please click the following link: <a href="${URL}">${URL}</a></p>',
  text: 'Someone (hopefully you) requested their account email to be updated to this one. \nTo confirm this, please access the following link: ${URL}'
}

//TODO: allow revert action
template.passwordUpdate = {
  from: 'spoopyproj Do Not Reply <spoopy@torcado.com>',
  subject: 'Password update notification',
  html: '<p>Your password has been changed</p>',
  text: 'Your password has been changed'
}

template.passwordReset = {
  url: 'https://spoopy-proj-v2.glitch.me/passwordreset/${TOKEN}',
  from: 'spoopyproj Do Not Reply <spoopy@torcado.com>',
  subject: 'Password reset request',
  html: '<p>A password reset for this account has been requested. To continue, please click the following link: <a href="${URL}">${URL}</a></p>',
  text: 'A password reset for this account has been requested. To continue, please access the following link: ${URL}'
}

var transporter = nodemailer.createTransport(options);

mailer.send = transporter.sendMail; //may end up changing this into a more customized function

mailer.sendVerify = function(email, token, callback){
  
  var url = fill(template.verify.url, {TOKEN: token});
  
  var message = {};
  
  message.to = email;
  message.from = template.verify.from;
  message.text = fill(template.verify.text, {URL: url});
  message.html = fill(template.verify.html, {URL: url});
  
  transporter.sendMail(message, callback);

}

mailer.sendUpdate = function(email, token, callback){
  
  var url = fill(template.update.url, {TOKEN: token});
  
  var message = {};
  
  message.to = email;
  message.from = template.update.from;
  message.text = fill(template.update.text, {URL: url});
  message.html = fill(template.update.html, {URL: url});

  transporter.sendMail(message, callback);
  
}

mailer.sendPasswordUpdate = function(email, callback){
  
  var message = {};
  
  message.to = email;
  message.from = template.passwordUpdate.from;
  message.text = template.passwordUpdate.text;
  message.html = template.passwordUpdate.html;

  transporter.sendMail(message, callback);
  
}

mailer.sendPasswordReset = function(email, token, callback){
  
  var url = fill(template.passwordReset.url, {TOKEN: token});
  
  var message = {};
  
  message.to = email;
  message.from = template.passwordReset.from;
  message.text = fill(template.passwordReset.text, {URL: url});
  message.html = fill(template.passwordReset.html, {URL: url});

  transporter.sendMail(message, callback);
  
}

module.exports = mailer;