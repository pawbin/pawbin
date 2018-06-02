const mongoose   = require('mongoose');

const User       = require('../app/models/user');
const Creature   = require('../app/models/creature');

let helper = {};

/**
 * Gets a creature from the database
 * @param {string|Object} username, email, or user object.
 *   @param {string} user.username
 *   @param {string} user.email
 * @returns {Promise} User
 */
helper.getCreature = function(data){
  return new Promise(function(resolve, reject){
    if(typeof data === 'number'){ //index
        Creature.findOne({'index': data}, function(err, creature) {
          if(err){
            reject(err);
          }
          if(creature){
            resolve(creature);
          } else {
            reject("none found");
          }
        });
    } else if(typeof data === 'string') { //name
      Creature.findOne({'name': { $regex : new RegExp(data, "i") } }, function(err, creature) {
        if(err){
          reject(err);
        }
        if(creature){
          resolve(creature);
        } else {
          reject("none found");
        }
      });
    } else { //object
      if(data.index){
        Creature.findOne({'index': data.index}, function(err, creature) {
          if(err){
            reject(err);
          }
          if(creature){
            resolve(creature);
          } else {
            reject("none found");
          }
        });
      } else if(data.name){
        Creature.findOne({'name': { $regex : new RegExp(data.name, "i") } }, function(err, creature) {
          if(err){
            reject(err);
          }
          if(creature){
            resolve(creature);
          } else {
            reject("none found");
          }
        });
      } else {
        reject("no suitable data");
      }
    }
  });
}


module.exports = helper;