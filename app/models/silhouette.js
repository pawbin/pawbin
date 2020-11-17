const mongoose = require('mongoose');

let silhouetteSchema = mongoose.Schema({
  creatureRef  : { type: mongoose.Schema.ObjectId, ref: 'Creature' },
  createdAt    : { type: Date, default: Date.now },
  duration     : Number,
  biome        : String, //technically duplicate information
  image        : String, //base64
});

// methods ======================

// creatureTypeSchema.methods.something = function(password) {
//     something
// };

// create the model for users and expose it to our app
module.exports = mongoose.model('Silhouette', silhouetteSchema);