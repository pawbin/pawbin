// load the things we need
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
//const gameHelper = require('../gameHelper.js');

// define the schema
let gameSchema = mongoose.Schema({
  biomes        : [
    { type: mongoose.Schema.ObjectId, ref: 'Biome' }
  ],
  time          : Number,
  day           : Number,
  month         : Number,
  
});

// methods ======================


// middleware ===================


// create the model
module.exports = mongoose.model('Game', gameSchema);