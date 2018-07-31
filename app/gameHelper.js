const mongoose         = require('mongoose');

const User             = require('../app/models/user');
const Creature         = require('../app/models/creature');
const CreatureInstance = require('../app/models/creatureInstance');

const serverHelper     = require('../app/serverHelper');
const creatureHelper   = require('../app/creatureHelper');

let helper = {};

/**
 * Generates a CreatureInstance and gives it to a user
 * @param {UserResolvable} 
 * @param {CreatureResolvable} 
 * @returns {Promise} User, CreatureInstance
 */
helper.catchCreature = function(user, creature){
  return new Promise(function(resolve, reject){
    creatureHelper.getCreature(creature).then(creature => {
      serverHelper.getUser(user).then(user => {
        let creatureInstance = new CreatureInstance({
          creatureRef: creature._id,
          ownerRef: user._id,
          obtained: Date.now(),
          sex: Math.round(Math.random()),
          stats: {
            power: Math.round(Math.random() * 12),
            speed: Math.round(Math.random() * 12),
            heart: Math.round(Math.random() * 12),
            wit:   Math.round(Math.random() * 12),
            soul:  Math.round(Math.random() * 12),
            charm: Math.round(Math.random() * 12)
          }
        });

        creatureInstance.save((err, instance) => {
          if(err){
            return reject(err);
          } else {
            user.creaturesRef.push(instance._id);
            user.save((err, user) => {
              if(err){
                return reject(err);
              } else {
                return resolve(user, instance);
              }
            });
          }
        });
      });
    });
  });
}

/**
 * Removes a creatureInstance from a user
 * @param {UserResolvable} 
 * @param {CreatureInstanceResolvable} 
 * @returns {Promise} User, CreatureInstance
 */
helper.releaseCreatureInstance = function(user, creatureInstance){
  return new Promise(function(resolve, reject){
    creatureHelper.getCreatureInstance(creatureInstance).then(creatureInstance => {
      serverHelper.getUser(user).then(user => {
        user.creaturesRef.splice(user.creaturesRef.indexOf(creatureInstance._id), 1);
        user.save((err, user) => {
          if(err){
            return reject(err);
          } else {
            //TODO: let sit in limbo for a week or something, to allow an undo
            creatureInstance.remove(function (err, creatureInstance) {
              if(err){
                return reject(err);
              } else {
                return resolve(user, creatureInstance);
              }
            });
          }
        });
      });
    });
  });
}


module.exports = helper;