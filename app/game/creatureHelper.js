const mongoose         = require('mongoose');

const User             = require('../models/user.js');
const CreatureType     = require('../models/creatureType.js');
const Creature         = require('../models/creature.js');

let helper = {};

/**
 * Gets a creature from the database
 * @param {string|Object} index, name, or creature object.
 *   @param {string} user.index
 *   @param {string} user.name
 * @returns {Promise} Creature
 */
helper.getCreatureType = function(data){
  return new Promise(function(resolve, reject){
    if(!data){
      return reject("getCreatureType: no data");
    }
    if(data instanceof CreatureType){
      return resolve(data);
    }
    if(typeof data === 'number'){ //index
      CreatureType.findOne({'index': data}, function(err, creature) {
        if(err){
          return reject(err);
        }
        if(creature){
          return resolve(creature);
        } else {
          return reject("getCreatureType: wrong index");
        }
      });
    } else if(typeof data === 'string') {
      if(mongoose.Types.ObjectId.isValid(data)) { //id
        CreatureType.findById(data, function(err, creature) {
          if(err){
            return reject(err);
          }
          if(creature){
            return resolve(creature);
          } else {
            return reject("getCreatureType: wrong id");
          }
        });
      } else { //name
        CreatureType.findOne({'name': { $regex : new RegExp(data, "i") } }, function(err, creature) {
          if(err){
            return reject(err);
          }
          if(creature){
            return resolve(creature);
          } else {
            return reject("getCreatureType: wrong name");
          }
        });
      }
    } else { //object
      if(data.index){
        CreatureType.findOne({'index': data.index}, function(err, creature) {
          if(err){
            return reject(err);
          }
          if(creature){
            return resolve(creature);
          } else {
            return reject("getCreatureType: wrong index");
          }
        });
      } else if(data.name){
        CreatureType.findOne({'name': { $regex : new RegExp(data.name, "i") } }, function(err, creature) {
          if(err){
            return reject(err);
          }
          if(creature){
            return resolve(creature);
          } else {
            return reject("getCreatureType: wrong name");
          }
        });
      } else {
        return reject("getCreatureType: no suitable data");
      }
    }
  });
}

helper.getCreature = function(data){
  return new Promise(function(resolve, reject){
    if(!data){
      return reject("getCreature: no data");
    }
    if(data instanceof Creature){
      return resolve(data);
    }
    if(mongoose.Types.ObjectId.isValid(data)){ //id
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
    } else if(typeof data === 'string'){ //codename
      Creature.findOne({'codename': data}, function(err, creature) {
        if(err){
          return reject(err);
        }
        if(creature){
          return resolve(creature);
        } else {
          return reject("getCreature: wrong codename");
        }
      });
    } else { //object
      if(data.codename){ 
        Creature.findOne({'codename': data.codename}, function(err, creature) {
          if(err){
            return reject(err);
          }
          if(creature){
            return resolve(creature);
          } else {
            return reject("getCreature: wrong codename");
          }
        });
      } else {
        return reject("getCreature: no suitable data");
      }
    }
  });
}



module.exports = helper;