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
  updateEmail  : {
    verifyURL  : String,
    newEmail   : String,
    createdAt  : Date
  },
  resetPassword: {
    verifyURL  : String,
    createdAt  : Date
  }
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

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);