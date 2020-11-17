const mongoose = require('mongoose');

let biomeSchema = mongoose.Schema({
  index                : Number,
  name                 : String,
  active               : Boolean,
  activeTime           : Number, //0 day, 1 night
  creatureBatch        : [
    { type: mongoose.Schema.ObjectId, ref: 'CreatureType' }
  ],
  creatureBatchReserve : [
    { type: mongoose.Schema.ObjectId, ref: 'CreatureType' }
  ],
  silhouettes          : [
    { type: mongoose.Schema.ObjectId, ref: 'Silhouette' }
  ],
});

// methods ======================

// biomeSchema.pre('save', function(next) {
//   if(this.creatureBatch.length === 0){
//     if(this.creatureBatchReserve.length > 0){
//       this.creatureBatch = this.biomeBatchReserve.slice(0); //NOTE: does this need to be a copy? a simple pointer assignment might be fine, since we are overwriting right after
//       this.creatureBatchReserve = [];
//       if(!gameHelper){
//         gameHelper = require('../gameHelper.js');
//       }
//       gameHelper.generateBatch(this.name).then(batch => {
//         console.log('auto-renewed ', key);
//         this.biomeBatchReserve = batch;
//         count--;
//         if(count <= 0){
//           next();
//         }
//       }).catch(console.error);
//     } else {
//       console.warn("biome reserve empty!", key);
//       count--;
//       if(count <= 0){
//         next();
//       }
//     }
//   } else {
//     count--;
//     if(count <= 0){
//       next();
//     }
//   }
// });

// create the model for users and expose it to our app
module.exports = mongoose.model('Biome', biomeSchema);