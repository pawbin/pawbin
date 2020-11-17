const mongoose         = require('mongoose');

const User             = require('../models/user.js');
const Game             = require('../models/game.js');
const CreatureType     = require('../models/creatureType.js');
const Creature         = require('../models/creature.js');
const Silhouette       = require('../models/silhouette.js');

const globalSettings   = require('../../config/globalSettings.js');

const userHelper       = require('../site/userHelper.js');
const creatureHelper   = require('../game/creatureHelper.js');
const populate         = require('../utility/populate.js');


module.exports = (game) => { //require game
  let helper = {};
  
  const gameController   = require('../game/gameController.js')(game);
  /**
 * Get the stored game object
 */
  /*
helper.game = () => {
  return new Promise((resolve, reject) => { 
    Game.findOne((err, game) => {
      if(err){
        return reject(err);
      }
      return resolve(game);
      //helper.renewBatch('grassland');
    });
  });
};
*/
  
  /**
 * Generates a Creature from a creatureType
 * @param {CreatureType} 
 * @param {UserResolvable} owner
 * @returns {Creature}
 */
  helper.generateCreature = function(creatureType, owner){
    return new Creature({
      creatureTypeRef: creatureType._id,
      ownerRef: owner && owner._id,
      obtained: owner && Date.now(),
      sex: Math.round(Math.random()),
      stats: {
        power: Math.floor(Math.random() * 13),
        speed: Math.floor(Math.random() * 13),
        heart: Math.floor(Math.random() * 13),
        wit:   Math.floor(Math.random() * 13),
        soul:  Math.floor(Math.random() * 13),
        charm: Math.floor(Math.random() * 13)
      }
    });
  }
  
  /**
 * Grabs a creature from a given biome batch, calling for a batch renewal if necessary
 * @param {String} biome 
 * @returns {Promise} batch
 */
  helper.grabCreatureTypeFromBatch = function(biome){
    biome = biome.toLowerCase();
    //get batch by biome name
    let batch = game[biome].creatureBatch;
    console.log({batch});
    if(!batch || batch.length === 0){
      console.log('new batch!!');
      batch = helper.renewBatch(biome)
      console.log('renewed batch', {batch});
    }
    
    //remove from batch
    let creatureTypeRef = batch.pop();
    
    let creatureType = game.creatureTypes.find(ct => ct._id === creatureTypeRef);
    //set to new batch
    game[biome].creatureBatch = batch;
    //TODO: check if batch is empty. if so, move reserve into batch
    return creatureType;
  }
  
  helper.storeCreature = function(creature, user){
    return new Promise(function(resolve, reject){
      creature.save((err, creature) => {
        if(err){
          return reject(err);
        } else {
          
          //add reference to stored creature in user
          user.creaturesRef.push(creature._id);
          
          //update user
          user.save((err, user) => {
            if(err){
              return reject(err);
            } else {
              return resolve(creature);
            }
          }); //update user
        }
      }); //save creature
    });
  }
  
  /**
 * returns a list of active silhouettes for the biome
 * @param {UserResolvable} 
 * @param {String} biome 
 * @returns {Promise} User, Creature
 */
  helper.getSilhouettes = function(biome, populatePath){
    return new Promise(function(resolve, reject){
      let docs = gameController.getSilhouettes(biome)
      if(!docs){
        return reject('getSilhouettes: failure');
      }
      if(populatePath){
        Silhouette.populate(docs, populate.compile(Silhouette.schema, populatePath), (err, docs) => {
          if(err){
            return reject(err);
          }
          if(docs){
            return resolve(docs);
          } else {
            return reject("getSilhouettes: failure");
          }
        });
      } else {
        return resolve(docs);
      }
    });
  }
  
  /**
 * returns a list of active silhouettes for the biome with populated creature
 * @param {UserResolvable} 
 * @param {String} biome 
 * @returns {Promise} User, Creature
 */
  /*
  helper.getSilhouettesWithCreature = function(biome){
    return new Promise((resolve, reject) => {
      let silhouettes = gameController.getSilhouettes(biome);
      let count = silhouettes.length;
      let populatedSilhouettes = [];
      silhouettes.forEach(doc => {
        doc.populate('creatureRef', (err, populated) => {
          if(err){
            return reject(err);
          }
          populatedSilhouettes.push(populated);
          count--;
          if(count === 0){
            fin();
          }
        });
      });
      function fin(){
        return resolve(populatedSilhouettes);
      }
    });
  }
  */
  
  /**
 * returns a list of active silhouettes for the biome with populated creature and type
 * @param {UserResolvable} 
 * @param {String} biome 
 * @returns {Promise} User, Creature
 */
  /*
  helper.getSilhouettesWithCreatureWithType = function(biome){
    return new Promise((resolve, reject) => {
      let silhouettes = gameController.getSilhouettes(biome);
      let count = silhouettes.length;
      let populatedSilhouettes = [];
      silhouettes.forEach(doc => {
        doc.populate({
          path: 'creatureRef', 
          populate: {
            path: 'creatureTypeRef'
          }
        }, (err, populated) => {
          if(err){
            return reject(err);
          }
          populatedSilhouettes.push(populated);
          count--;
          if(count === 0){
            fin();
          }
        });
      });
      function fin(){
        return resolve(populatedSilhouettes);
      }
    });
  }
  */
  
  /**
 * Pulls a creature from the creaturebatch and gives it to a user
 * @param {UserResolvable} 
 * @param {String} biome 
 * @param {String} silhouetteId 
 * @returns {Promise} User, Creature
 */
  helper.catchSilhouette = function(user, biome, silhouetteId){
    return new Promise(function(resolve, reject){
      //resolve user
      userHelper.getUser(user).then(user => {
        let silhouette = gameController.catchSilhouette(biome, silhouetteId);
        
        let creature = silhouette.creatureRef;
        
        //add reference to stored creature in user
        user.creaturesRef.push(creature._id);
        
        //update user
        user.save((err, user) => {
          if(err){
            return reject(err);
          } else {
            return resolve(creature);
          }
        }); //update user
      }).catch(reject); //resolve user
    }); //promise
  }
  
  /**
 * Pulls a creature from the creaturebatch and gives it to a user
 * @param {UserResolvable} 
 * @param {String} biome 
 * @returns {Promise} User, Creature
 */
  helper.catchCreature = function(user, biome){
    return new Promise(function(resolve, reject){
      //resolve user
      userHelper.getUser(user).then(user => {
        //grab new creature
        let creatureType = helper.grabCreatureTypeFromBatch(biome)
        let creature = helper.generateCreature(creatureType, user);
        //store new creature in database
        helper.storeCreature(creature, user).then(resolve).catch(reject);
      }).catch(reject); //resolve user
    }); //promise
  }
  
  /**
 * Generates a creature and gives it to a user
 * @param {UserResolvable} 
 * @param {CreatureTypeResolvable} 
 * @returns {Promise} User, Creature
 */
  helper.spawnCreature = function(user, creatureType){
    return new Promise(function(resolve, reject){
      //resolve creature
      creatureHelper.getCreatureType(creatureType).then(creatureType => {
        //resolve user
        userHelper.getUser(user).then(user => {
          //create new creature
          let creature = helper.generateCreature(creatureType, user);
          //store new creature in database
          helper.storeCreature(creature, user).then(resolve).catch(reject);
        }).catch(reject); //resolve user
      }).catch(reject); //resolve creature
    }); //promise
  }
  
  /**
 * Removes a creature from a user
 * @param {UserResolvable} 
 * @param {CreatureResolvable} 
 * @returns {Promise} User, Creature
 */
  helper.releaseCreature = function(user, creature){
    return new Promise(function(resolve, reject){
      //resolve creature
      creatureHelper.getCreature(creature).then(creature => {
        //resolve user
        userHelper.getUser(user).then(user => {
          //remove the creature from the user's collection
          user.creaturesRef.splice(user.creaturesRef.indexOf(creature._id), 1);
          //update user
          user.save((err, user) => {
            if(err){
              return reject(err);
            } else {
              //remove creature from database collection
              //TODO: let sit in limbo for a week or something, to allow an undo
              //  OR, don't actually remove data, just remove ownership reference (but leave some 'last-owned' detail to know who owned it)
              creature.remove(function (err, creature) {
                if(err){
                  return reject(err);
                } else {
                  return resolve(creature);
                }
              }); //remove creature
            }
          }); //update user
        }).catch(reject);; //resolve user
      }).catch(reject); //resolve creature
    }); //promise
  }
  
  /**
 * Generates a new batch of creatureTypes for a given biome
 * @param {String} biome 
 * @returns {Promise} batch
 */
  helper.generateBatch = function(biome){
    biome = biome.toLowerCase();
    
    let refBatch = [];
    
    let candidateTypes = game.creatureTypes.filter(ct => ct.biome === biome);
    
    if(candidateTypes.length == 0){
      console.log('generateBatch: no candidates')
    }
    let weights = globalSettings.game.batchWeights;
    //for each rarity type:
    Object.keys(weights).forEach(rarity => {
      rarity = parseInt(rarity);
      //grab all creatureTypes with current rarity:
      let creatureRaritySet = candidateTypes.filter(v => v.rarity === rarity);
      let refRarityBatch = [];
      // add entire set of creatureTypes of this rarity n times, until a remainder for the weight size is less than the size of the rarity set (this is a terrible explanation im sorry) 
      
      if(Math.floor(weights[rarity] / creatureRaritySet.length) === Infinity){
        return false;
      }
      
      for(let j = 0; j < Math.floor(weights[rarity] / creatureRaritySet.length); j++){ 
        refRarityBatch.push(...creatureRaritySet);
      }
      //randomly remove creatureTypes from the rarity set overflow (until refRarityBatch matches batch weight)
      let overflow = [...creatureRaritySet];
      let numToRemove = overflow.length - (weights[rarity] - refRarityBatch.length);
      for(let j = 0; j < numToRemove; j++){
        overflow.splice(Math.floor(Math.random() * overflow.length), 1); //remove one item at random location
      }
      refRarityBatch.push(...overflow); //add overflow
      refBatch.push(...refRarityBatch) //add entire rarity batch to main batch
    });
    //if for some reason our current batch is less than what's specified in the config
    if(refBatch.length < globalSettings.game.batchSize){
      //randomly fill in common creatureTypes
      let fillRarity = globalSettings.game.batchFillRarity;
      let creatureRaritySet = candidateTypes.filter(v => v.rarity === fillRarity);
      let remaining = globalSettings.game.batchSize - refBatch.length;
      for(let i = 0; i < remaining; i++){
        refBatch.push(creatureRaritySet[Math.floor(Math.random() * creatureRaritySet.length)]); //pick random creature
      }
    }
    
    return refBatch;
  }
  
  /**
 * fills the creatureBatch for a biome
 * @param {String} biome 
 * @returns {Promise} batch
 */
  helper.renewBatch = function(biome){
    biome = biome.toLowerCase();
    let batch = helper.generateBatch(biome)
    batch = batch.map(c => c._id); //get a list of only ids
    game[biome].creatureBatch = batch;
    console.log(game[biome].creatureBatch);
    console.log("batch for " + biome + " renewed!");
    return batch;
  }
  
  
  return helper; 
}