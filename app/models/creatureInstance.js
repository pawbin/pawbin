const mongoose = require('mongoose');

const utility = require('../utility.js');

let creatureInstanceSchema = mongoose.Schema({
  index        : Number,
  codename     : String,
  creatureRef	 : { type: mongoose.Schema.ObjectId, ref: 'Creature' },
  ownerRef  	 : { type: mongoose.Schema.ObjectId, ref: 'User' },
  obtained	   : Date,
  nickname	   : String,
  bond	       : Number,
  sex	         : Number,
  stats	       : {
    power      : Number,
    speed      : Number,
    heart      : Number,
    wit        : Number,
    soul       : Number,
    charm      : Number,
  }
});



// methods ======================

// creatureSchema.methods.something = function(password) {
//     something
// };

// middleware ===================
creatureInstanceSchema.pre('save', function(next) {
  let that = this;
  //copy batch reserve to empty batch
  if(this.isNew && !this.codename){
    this.constructor.count({}, function(err, count){ //this.constructor used to get current Model (since it isnt made yet in this context), which is used to query a count
      if(err){
        console.error(err)
      } else {
        that.index = count + 1;
        that.codename = utility.getCodename(that.index);
      }
      next(); //only continue after finishing. this creates synchronous prehook, ensuring codename will not collide with another instance
    });
  } else {
    next();
  }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('CreatureInstance', creatureInstanceSchema);