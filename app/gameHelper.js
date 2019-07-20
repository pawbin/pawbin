const mongoose         = require('mongoose');

const User             = require('../app/models/user');
const Game             = require('../app/models/game');
const Creature         = require('../app/models/creature');
const CreatureInstance = require('../app/models/creatureInstance');

const globalSettings   = require('../config/globalSettings.js');

const serverHelper     = require('../app/serverHelper');
const creatureHelper   = require('../app/creatureHelper');

let helper = {};

/**
 * Generates a CreatureInstance and gives it to a user
 * @param {UserResolvable} 
 * @param {CreatureResolvable} 
 * @returns {Promise} User, CreatureInstance
 */
helper.catchCreatureInstance = function(user, creature){
  return new Promise(function(resolve, reject){
    
    //resolve creature
    creatureHelper.getCreature(creature).then(creature => {
      
      //resolve user
      serverHelper.getUser(user).then(user => {
        
        //create new creature
        let creatureInstance = new CreatureInstance({
          creatureRef: creature._id,
          ownerRef: user._id,
          obtained: Date.now(),
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
        
        //store new creature in database
        creatureInstance.save((err, instance) => {
          if(err){
            return reject(err);
          } else {
            
            //add reference to stored creature in user
            user.creaturesRef.push(instance._id);
            
            //update user
            user.save((err, user) => {
              if(err){
                return reject(err);
              } else {
                return resolve(instance);
              }
            }); //update user
          }
        }); //save creature
      }).catch(reject);; //resolve user
    }).catch(reject);; //resolve creature
  }); //promise
}

/**
 * Removes a creatureInstance from a user
 * @param {UserResolvable} 
 * @param {CreatureInstanceResolvable} 
 * @returns {Promise} User, CreatureInstance
 */
helper.releaseCreatureInstance = function(user, creatureInstance){
  return new Promise(function(resolve, reject){
    
    //resolve creatureInstance
    creatureHelper.getCreatureInstance(creatureInstance).then(creatureInstance => {
      
      //resolve user
      serverHelper.getUser(user).then(user => {
        
        //remove the creatureInstance from the user's collection
        user.creaturesRef.splice(user.creaturesRef.indexOf(creatureInstance._id), 1);
        
        //update user
        user.save((err, user) => {
          if(err){
            return reject(err);
          } else {
            
            //remove creatureInstance from database collection
            //TODO: let sit in limbo for a week or something, to allow an undo
            creatureInstance.remove(function (err, creatureInstance) {
              if(err){
                return reject(err);
              } else {
                return resolve(creatureInstance);
              }
            }); //remove creatureInstance
          }
        }); //update user
      }).catch(reject);; //resolve user
    }).catch(reject); //resolve creatureInstance
  }); //promise
}

/**
 * Grabs a creature from a given biome batch, calling for a batch renewal if necessary
 * @param {String} biome 
 * @returns {Promise} batch
 */
helper.grabCreatureFromBatch = function(biome){
  return new Promise(function(resolve, reject){
    
    //get batch by biome name
    let batch = helper.game.biomeBatches[biome.toLowerCase()];
    
    let creatureRef = batch.pop();
    
    CreatureInstance.findById(creatureRef, (err, creatureInstance) => {
      if(err){
        reject(err);
      } else {
        helper.game.save((err, game) => {
          if(err){
            reject(err);
          } else {
            resolve(creatureInstance);
          }
        });
      }
    });
    
  });
}

/**
 * Generates a new batch of creatureInstances for a given biome
 * @param {String} biome 
 * @returns {Promise} batch
 */
helper.renewBatch = function(biome){
  
  //get batch by biome name
  let batch = helper.game.biomeBatchReserves[biome.toLowerCase()];
  let refBatch = [];
  
  Creature.find({'biome': biome}, (err, creatures) => {
    if(err){
      console.error(err);
    } else if(creatures.length > 0) {
      let weights = globalSettings.game.batchWeights;
      //for each rarity type:
      Object.keys(weights).forEach(rarity => {
        //grab all creatures with current rarity:
        let creatureRaritySet = creatures.filter(v => v.rarity === rarity); 
        let refRarityBatch = [];
        // add entire set of creatures of this rarity n times, until a remainder for the weight size is less than the size of the rarity set (this is a terrible explanation im sorry) 
        for(let j = 0; j < Math.floor(weights[rarity] / creatureRaritySet.length); j++){ 
          refRarityBatch.push(...creatureRaritySet);
        }
        //randomly remove creatures from the rarity set overflow (until refRarityBatch matches batch weight)
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
        //randomly fill in common creatures
        let fillRarity = globalSettings.game.batchFillRarity;
        let creatureRaritySet = creatures.filter(v => v.rarity === fillRarity); 
        for(let i = 0; i < globalSettings.game.batchSize - refBatch.length; i++){
          refBatch.push(creatureRaritySet[Math.floor(Math.random() * creatureRaritySet.length)]); //pick random creature
        }
      }
      
      //send newly generated batch to database
      // (maybe i can use `batch` here? im not completely confident about raw reference assignment)
      helper.game.biomeBatchReserves[biome.toLowerCase()] = refBatch.slice(0);
      helper.game.save((err, savedUser) => {
        if(err){
          console.error(err);
        } else {
          console.log("batch for " + biome + " renewed!");
        }
      });
      console.log(helper.game);
      
    } else {
      console.log(creatures.length);
    }
  });
  
}


module.exports = helper;