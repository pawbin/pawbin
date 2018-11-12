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
  
})


/*var userSchema = mongoose.Schema({

    local              : {
        email          : String,
        username       : String,
        password       : String
    },
    avatar             : String,
    nickname           : String,
    joindate           : Date,
    coins              : Number,
    dollars            : Number,
    settings           : {
      gorefilter       : Boolean,
      theme            : String
    },
    achievements       : [{
        name           : String,
        progress       : Number,
        timestamp      : Date
    }],
    bestiary           : [{
        name           : String,
        progress       : Number
    }],
    profile            : {
        description    : String,
        comments       : [{
            user       : {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            content    : String,
            timestamp  : Date
        }]
    },
    creatures          : [{
        //itemId
        nickname       : String,
        bond           : Number,
        sex            : Number,
        attributes     : [{
          
        }]
    }],
    inventory          : [{
        item           : {
            item       : {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            count      : Number
        }
    }],
    exchanges          : [{
        user           : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp      : Date,
        itemin         : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        },
        itemout        : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        },
        quantityin     : Number,
        quantityout    : Number,
        trade          : Boolean,
        result         : Boolean
    }],
    store              : [{
        listing        : {
            timestamp      : Date,
            itemin         : {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            itemout        : {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            quantityin     : Number,
            quantityout    : Number,
            result         : Boolean
        }
    }],
});*/

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

// add creature to user
userSchema.methods.addCreature = function(creature) {
  if(!creature)
    return;
  this.creatures.push({creatureId: creature._id});
  this.save(function(err, saved){
    if(err)
      console.log(err);
  });
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);