var User = require('../app/models/user'),
    mongoose = require('mongoose'),
    nev = require('email-verification')(mongoose);
var bcrypt = require('bcrypt');

var myHasher = function(password, tempUserData, insertTempUser, callback) {
  var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  return insertTempUser(hash, tempUserData, callback);
};

nev.configure({
    verificationURL: 'https://spoopy-proj-v2.glitch.me/verify/${URL}',
    URLLength: 32,
 
    // mongo-stuff 
    persistentUserModel: User,
    tempUserCollection: 'tempusers',
    emailFieldName: 'local.email',
    passwordFieldName: 'local.password',
    URLFieldName: 'GENERATED_VERIFYING_URL',
    expirationTime: 86400,
  
    transportOptions: {
        host: 'server137.web-hosting.com',
        port: 465,
        secure: true, // secure:true for port 465, secure:false for port 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    },
  
    verifyMailOptions: {
        from: 'Do Not Reply <spoopy@torcado.com>',
        subject: 'Please confirm account',
        html: 'Click the following link to confirm your account:</p><p>${URL}</p>',
        text: 'Please confirm your account by clicking the following link: ${URL}'
    },
 
    shouldSendConfirmation: false,
//     confirmMailOptions: {
//         from: 'Do Not Reply <user@gmail.com>',
//         subject: 'Successfully verified!',
//         html: '<p>Your account has been successfully verified.</p>',
//         text: 'Your account has been successfully verified.'
//     },
 
    hashingFunction: null
  
  
}, function(error, options){
  
});

nev.generateTempUserModel(User, function(err, model){
  if(err){
    console.log(err);
  } else {
    nev.myTempModel = model;
  }
});

module.exports = nev;