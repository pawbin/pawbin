// load the things we need
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

// define the schema for our user model
let userSchema = mongoose.Schema({
  // user data involved in logging in or authentication
  // this is stuff that gets accessed very frequently
  local        : {
    email      : String,
    username   : String,
    nickname   : String,
    password   : String
  },
  
  joinedOn     : { type: Date, default: Date.now },
  
  // the values for currency that the user has
  currency     : {
    coin       : { type: Number, default: 0 },
    premium    : { type: Number, default: 0 }
  },
  
  // specifies the authorization of this user
  rights       : { type: String, default: "user" },
  
  // array of id objects representing creatureInstance objects
  creaturesRef : [
    { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
  ],
  
  // TEMPORARY: exists when the user is attempting to update their email
  updateEmail  : {
    verifyURL  : String,
    newEmail   : String,
    createdAt  : Date
  },
  
  // TEMPORARY: exists when the user is attempting to reset their password
  resetPassword: {
    verifyURL  : String,
    createdAt  : Date
  },
  
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password matches hash
userSchema.methods.checkPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);