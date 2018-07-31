const mongoose = require('mongoose');

let creatureSchema = mongoose.Schema({
  index        : Number,
  name         : String,
  image        : String,
  biome        : String,
  bodyType     : String,
  flavorText   : String,
  rarity       : Number,
  creator      : {
    name       : String,
    userRef    : { type: mongoose.Schema.ObjectId, ref: 'User' }
  }
});

// methods ======================

// creatureSchema.methods.something = function(password) {
//     something
// };

// create the model for users and expose it to our app
module.exports = mongoose.model('Creature', creatureSchema);