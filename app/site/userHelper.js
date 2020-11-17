const mongoose     = require('mongoose');
const User         = require('../models/user.js');
const userPublic   = require('../models/userPublic.js');
const TempUser     = require('../models/tempUser.js');
const serverHelper = require('../site/serverHelper.js');
const populate     = require('../utility/populate.js');
const utils        = require('../utility/utils.js');

let helper = {};

/**
 * Returns a query for a user
 * @param {string|Object} username, email, id, or user object.
 *   @param {string} user.username
 *   @param {string} user.email
 *   @param {string} user.local.username
 *   @param {string} user.local.email
 * @returns {Promise} User
 */
helper.getUserQuery = function(data){
  if(!data){
    console.error('getUser: no data');
    return;
    //return reject("getUser: no data");
  }
  if(data instanceof User){
    return data;
  }
  if(typeof data === 'string'){
    if(mongoose.Types.ObjectId.isValid(data)) { //id
      return User.findById(data);
    } else if(/\S+@\S+\.\S+/.test(data)){ //email
      return User.findOne({'local.email': data});
    } else { //username (probably)
      return User.findOne({'local.username': data});
    }
  } else { //object
    if(data.username || (data.local && data.local.username)){
      return User.findOne({'local.username': data.username || data.local.username});
    } else if(data.email || (data.local && data.local.email)){
      return User.findOne({'local.email': data.email || data.local.email});
    } else {
      console.error("getUser: no suitable data");
      return;
      //return reject("getUser: no suitable data");
    }
  }
}

/**
 * Gets a user from the database
 * @param {string|Object} username, email, id, or user object.
 *   @param {string} user.username
 *   @param {string} user.email
 *   @param {string} user.local.username
 *   @param {string} user.local.email
 * @returns {Promise} User
 */
helper.getUser = function(data, populatePath){
  return new Promise(function(resolve, reject){
    let query = helper.getUserQuery(data);
    if(!query){
      return reject('getUser: failure');
    }
    if(populatePath){
      query = query.populate(populate.compile(User.schema, populatePath));
    }
    (query.exec || query.execPopulate).bind(query)((err, doc) => {
      if(err){
        return reject(err);
      }
      if(doc){
        return resolve(doc);
      } else {
        return reject("getUser: failure");
      }
    });
  });
}

/**
 * Gets all users from the database
 * @param {string|Object} username, email, id, or user object.
 *   @param {string} user.username
 *   @param {string} user.email
 *   @param {string} user.local.username
 *   @param {string} user.local.email
 * @returns {Promise} User
 */
helper.getUsers = function(populatePath){
  return new Promise(function(resolve, reject){
    let query = User.find({});
    if(!query){
      return reject('getUsers: failure');
    }
    if(populatePath){
      query = query.populate(populate.compile(User.schema, populatePath));
    }
    (query.exec || query.execPopulate).bind(query)((err, doc) => {
      if(err){
        return reject(err);
      }
      if(doc){
        return resolve(doc);
      } else {
        return reject("getUsers: failure");
      }
    });
  });
}

/**
 * Gets a user with only its public fields from the database
 * @param {string|Object} username, email, id, or user object.
 *   @param {string} user.username
 *   @param {string} user.email
 *   @param {string} user.local.username
 *   @param {string} user.local.email
 * @returns {Promise} User
 */
helper.getUserPublic = function(data, populatePath){
  return new Promise(function(resolve, reject){
    helper.getUser(data, populatePath).then(user => {
      return resolve(utils.pick(user, userPublic));
    }).catch(reject);
  });
}


/**
 * Returns a query for a tempUser
 * @param {string|Object} username, email, or user object.
 *   @param {string} user.username
 *   @param {string} user.email
 * @returns {Promise} User
 */
helper.getTempUserQuery = function(data){
  if(!data){
    console.error('getTempUser: no data');
    return;
    //return reject("getUser: no data");
  }
  if(data instanceof User){
    return data;
  }
  if(typeof data === 'string'){
    if(mongoose.Types.ObjectId.isValid(data)) { //id
      return TempUser.findById(data);
    } else if(/\S+@\S+\.\S+/.test(data)){ //email
      return TempUser.findOne({'local.email': data});
    } else { //username (probably)
      return TempUser.findOne({'local.username': data});
    }
  } else { //object
    if(data.username || (data.local && data.local.username)){
      return TempUser.findOne({'local.username': data.username || data.local.username});
    } else if(data.email || (data.local && data.local.email)){
      return TempUser.findOne({'local.email': data.email || data.local.email});
    } else {
      console.error("getTempUser: no suitable data");
      return;
      //return reject("getUser: no suitable data");
    }
  }
}

/**
 * Gets a tempUser from the database
 * @param {string|Object} username, email, or user object.
 *   @param {string} user.username
 *   @param {string} user.email
 * @returns {Promise} User
 */
helper.getTempUser = function(data){
  return new Promise(function(resolve, reject){
    let query = helper.getTempUserQuery(data);
    if(!query){
      return reject('getUser: failure');
    }
    query.exec((err, doc) => {
      if(err){
        return reject(err);
      }
      if(doc){
        return resolve(doc);
      } else {
        return reject("getTempUser: failure");
      }
    });
  });
}

/**
 * returns array of creatures the user owns
 * @param {Object} userResolvable
 * @param {Object} populatePath
 */
helper.getCreatures = function(userResolvable, populatePath){
  return new Promise(function(resolve, reject){
    let query = helper.getUserQuery(userResolvable);
    if(populatePath){
      query = query.populate(populate.compile(User.schema, populatePath));
    }
    (query.exec || query.execPopulate).bind(query)(function(err, user) {
      if(err){
        return reject(err);
      }
      if(!user){
        return reject('no user');
      }
      return resolve(user.creaturesRef);
    });
  });
}

/*
helper.getCreaturesWithType = function(userId){
  return new Promise(function(resolve, reject){
    //TODO: serverHelper (userHelper?) function to return query. (getUserQuery());
    User.findById(userId).populate({
      path: 'creaturesRef', 
      populate: {
        path: 'creatureTypeRef', 
        model: 'CreatureType'
      }
    }).exec(function(err, user) {
      if(err){
        return reject(err);
      }
      if(!user){
        return reject('no user');
      }
      console.log('AAAAAAAAAAAAAAAAAAAAAAAAAA')
      console.log(user.creaturesRef)
      return resolve(user.creaturesRef);
    });
  });
}
*/

module.exports = helper;