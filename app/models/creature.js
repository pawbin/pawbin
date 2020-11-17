const mongoose = require('mongoose');

const utility = require('../utility/utils.js');

let creatureSchema = mongoose.Schema({
  index           : Number,
  codename        : String,
  creatureTypeRef : { type: mongoose.Schema.ObjectId, ref: 'CreatureType' },
  ownerRef  	    : { type: mongoose.Schema.ObjectId, ref: 'User' },
  obtained	      : Date,
  createdAt       : { type: Date, default: Date.now },
  nickname	      : String,
  bond	          : Number,
  sex	            : Number,
  stats	          : {
    power         : Number,
    speed         : Number,
    heart         : Number,
    wit           : Number,
    soul          : Number,
    charm         : Number,
  }
});



// methods ======================

// creatureSchema.methods.something = function(password) {
//     something
// };

// middleware ===================
let lastIndex;
creatureSchema.pre('save', function(next) {
  let self = this;
  if(this.isNew && !this.codename){
    //safeguard in case creature is saved before server finishes starting
    if(lastIndex === undefined){
      this.constructor.findOne({}).sort('-index').exec(function(err, creature){ //this.constructor used to get current Model (since it isnt made yet in this context), which is used to query a count
        if(err){
          console.error(err);
        } else {
          lastIndex = creature && creature.index || 0;
          let nextIndex = lastIndex + 1;
          let {name, index} = utility.getSafeCodename(nextIndex);
          self.codename = name;
          self.index = index;
        }
        next(); //only continue after finishing. this creates synchronous prehook, ensuring codename will not collide with another instance
      });
    } else {
      let nextIndex = lastIndex + 1;
      let {name, index} = utility.getSafeCodename(nextIndex);
      self.codename = name;
      self.index = index;
      lastIndex = index;
      next();
    }
  } else {
    next();
  }
});


let model = mongoose.model('Creature', creatureSchema);
// initialize lastIndex
model.findOne({}).sort('-index').exec((err, creature) => {
  if(err){
    return console.error(err);
  }
  lastIndex = creature.index;
});
// create the model for users and expose it to our app
module.exports = model;