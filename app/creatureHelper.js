const mongoose         = require('mongoose');

const User             = require('../app/models/user');
const Creature         = require('../app/models/creature');
const CreatureInstance = require('../app/models/creatureInstance');

let helper = {};

/**
 * Gets a creature from the database
 * @param {string|Object} index, name, or creature object.
 *   @param {string} user.index
 *   @param {string} user.name
 * @returns {Promise} Creature
 */
helper.getCreature = function(data){
  return new Promise(function(resolve, reject){
    if(!data){
      return reject("getCreature: no data");
    }
    if(data instanceof Creature){
      return resolve(data);
    }
    if(typeof data === 'number'){ //index
        Creature.findOne({'index': data}, function(err, creature) {
          if(err){
            return reject(err);
          }
          if(creature){
            return resolve(creature);
          } else {
            return reject("getCreature: wrong index");
          }
        });
    } else if(typeof data === 'string') {
      if(mongoose.Types.ObjectId.isValid(data)) { //id
        Creature.findById(data, function(err, creature) {
          if(err){
            return reject(err);
          }
          if(creature){
            return resolve(creature);
          } else {
            return reject("getCreature: wrong id");
          }
        });
      } else { //name
        Creature.findOne({'name': { $regex : new RegExp(data, "i") } }, function(err, creature) {
          if(err){
            return reject(err);
          }
          if(creature){
            return resolve(creature);
          } else {
            return reject("getCreature: wrong name");
          }
        });
      }
    } else { //object
      if(data.index){
        Creature.findOne({'index': data.index}, function(err, creature) {
          if(err){
            return reject(err);
          }
          if(creature){
            return resolve(creature);
          } else {
            return reject("getCreature: wrong index");
          }
        });
      } else if(data.name){
        Creature.findOne({'name': { $regex : new RegExp(data.name, "i") } }, function(err, creature) {
          if(err){
            return reject(err);
          }
          if(creature){
            return resolve(creature);
          } else {
            return reject("getCreature: wrong name");
          }
        });
      } else {
        return reject("getCreature: no suitable data");
      }
    }
  });
}

helper.getCreatureInstance = function(data){
  return new Promise(function(resolve, reject){
    if(!data){
      return reject("getCreature: no data");
    }
    if(data instanceof CreatureInstance){
      return resolve(data);
    }
    if(mongoose.Types.ObjectId.isValid(data)){ //id
        CreatureInstance.findById(data, function(err, creatureInstance) {
          if(err){
            return reject(err);
          }
          if(creatureInstance){
            return resolve(creatureInstance);
          } else {
            return reject("getCreature: wrong id");
          }
        });
    } else {
      return reject("getCreature: no suitable data");
    }
  });
}



module.exports = helper;