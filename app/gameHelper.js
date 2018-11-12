const mongoose         = require('mongoose');
const random           = require('random-seed');

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
helper.catchCreatureInstance = function(user, creature){
  return new Promise(function(resolve, reject){
    creatureHelper.getCreature(creature).then(creature => {
      serverHelper.getUser(user).then(user => {
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

        creatureInstance.save((err, instance) => {
          if(err){
            return reject(err);
          } else {
            user.creaturesRef.push(instance._id);
            user.save((err, user) => {
              if(err){
                return reject(err);
              } else {
                return resolve(instance);
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
                return resolve(creatureInstance);
              }
            });
          }
        });
      });
    });
  });
}


/**
 * Generates the codename for a creature given its index
 * @param {number} index 
 * @returns {string} codename
 */
let alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
//let alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
let coprimes = [17, 499, 10861, 293269, 6131473, 38581661];
helper.getCodename = function(index){
  //find length of name, which is this stupid dumb formula
  let nameLength = Math.floor(Math.log((alphabet.length - 1) * index + alphabet.length) / Math.log(alphabet.length));
  
  //pull the index down by sum of 26^n-1 to 0
  let pulledIndex = index - (Math.pow(alphabet.length, nameLength - 1) - alphabet.length) / (alphabet.length - 1);
  
  //seeded random number generator with seed being the length of the name
  // (once we hit index 27, the order will be different than it was for indeces 1-26)
  let gen = random.create(nameLength);
  
  //randomize order
  for(let i = alphabet.length - 1; i > 0; i--){
    let j = Math.floor(gen.random() * (i + 1));
    [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
  }
  
  //generate sring of length n
  function string(index, n){
  
    //get nth coprime from list
    let coprime = coprimes[n - 1];

    //shift index by coprime
    index = ((index * coprime) + coprime) % Math.pow(alphabet.length, n);
    
    //generate string
    let name = '';
    for(let c = 0; c < n; c++){
      name += alphabet[(Math.floor(index / Math.pow(alphabet.length, c))) % alphabet.length];
    }
    return name;
  }

  //call string with new index and namelength, and return it
  return string(pulledIndex, nameLength);
}

for(let i = 0; i < 800; i++){
  console.log(helper.getCodename(i));
}


module.exports = helper;