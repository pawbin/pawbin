const mongoose = require('mongoose');

let creatureSchema = mongoose.Schema({
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

// create the model for users and expose it to our app
module.exports = mongoose.model('CreatureInstance', creatureSchema);