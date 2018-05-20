// load the things we need
const mongoose = require('mongoose');

// define the schema for our user model
var creatureSchema = mongoose.Schema({
  index        : Number,
  name         : String,
  image        : String,
  biome        : String,
  bodyType     : String,
  flavorText   : String,
  rarity       : Number,
  creator      : {
    name       : String,
    userId     : { type: mongoose.Schema.ObjectId, ref: 'User' }
  }
})

// methods ======================

// creatureSchema.methods.something = function(password) {
//     something
// };

// create the model for users and expose it to our app
module.exports = mongoose.model('Creature', creatureSchema);