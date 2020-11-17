const User         = require('../models/user');
const serverHelper = require('../site/serverHelper.js');

class Rights extends Array {
  
  /**
   * Checks if an entity has sufficient rights
   * @param {user|string} user or right
   * @returns {boolean}
   */
  check(entity, right) {
    if(!right || right.length === 0){
      return true;
    }
    if(Array.isArray(right)){
      // maybe want to run check on all rights? not sure
      right = right[0];
    }
    if(typeof right === 'string'){
      if(!this.includes(right)){
        return false; // failsafe
      }
    }
    let check = entity;
    if(entity instanceof User){
      check = entity.rights;
    }
    return this.indexOf(check) >= 0 && this.indexOf(check) <= this.indexOf(right);
  }
}

let rights = new Rights(
  'admin',
  'moderator',
  'user'
)
module.exports = rights;