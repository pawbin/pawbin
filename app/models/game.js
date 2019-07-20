// load the things we need
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

// define the schema
let gameSchema = mongoose.Schema({
  biomeBatchReserves  : {
    mountain           : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    desert             : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    grassland          : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    rainforest         : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    beach              : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    dream              : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    volcano            : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    tundra             : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    forest             : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    swamp              : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    ocean              : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    nightmare          : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ]
  },
  biomeBatches         : {
    mountain           : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    desert             : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    grassland          : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    rainforest         : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    beach              : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    dream              : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    volcano            : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    tundra             : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    forest             : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    swamp              : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    ocean              : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ],
    nightmare          : [
      { type: mongoose.Schema.ObjectId, ref: 'CreatureInstance' }
    ]
  }
});

// methods ======================


// middleware ===================
gameSchema.pre('save', function(next) {
  //copy batch reserve to empty batch
  Object.keys(this.biomeBatches).forEach(key => {
    if(this.biomeBatches[key].length === 0){
      if(this.biomeBatchReserves[key].length > 0){
        this.biomeBatches[key] = this.biomeBatchReserves[key].slice(0);
        this.biomeReserves[key] = [];
      } else {
        console.warn("biome reserve empty!", key);
      }
    }
  });
  
  next();
});

// create the model
module.exports = mongoose.model('Game', gameSchema);