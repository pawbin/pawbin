// load the things we need
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

// define the schema for our user model
let userSchema = mongoose.Schema({
  local        : {
    email      : String,
    username   : String,
    nickname   : String,
    password   : String
  },
  
  verifyURL    : String,
  
  createdAt    : {
    type       : Date,
    default    : Date.now,
    expires    : '24h'
  }
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.checkPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('TempUser', userSchema);