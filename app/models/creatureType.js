const mongoose = require('mongoose');

let creatureTypeSchema = mongoose.Schema({
  index        : Number,
  name         : String,
  biome        : String,
  flavorText   : String,
  rarity       : Number,
  scale        : Number,
  creator      : {
    name       : String,
  },
  images       : {
    full_lg       : String,
    full_s_lg     : String,
    relative_md   : String,
    relative_s_md : String,
    icon_sm       : String,
    icon_s_sm     : String,
  }
});

// methods ======================

// creatureTypeSchema.methods.something = function(password) {
//     something
// };

// create the model for users and expose it to our app
module.exports = mongoose.model('CreatureType', creatureTypeSchema);