/**
 * api.js
 * all api methods are preceeded by an endpoint
 * methods that require body info (such as complete objects) or anything that isnt a simple ID
 *   will be GET endpoints and will usually start with 'get'. the endpoint itself will usually
 *   not include 'get', 'post', etc.
 * all api methods return a promise
 * to require the api, you must call it as a function with no parameter
 * certain endpoints may require certain permissions, this restriction is only placed on client
 *   requests, not on server calls (the server is allowed to run every method)
 *   this means if a server->api call originates at a user's request, the server must ensure
 *   they have the correct permissions beforehand
 */
const serverHelper = require("./site/serverHelper.js");
const userHelper = require("./site/userHelper.js");
const rights = require("./site/rights.js");
const gameSetup = require("./game/setup.js");

const globalSettings = require("../config/globalSettings.js");

let gameHelper;
gameSetup.then(game => {
  gameHelper = require("./game/gameHelper.js")(game);
});

module.exports = app => {
  if(!app){
    app = {get(){},post(){}}; //catch all enpoint setups without app
  }
  
  let api = {};
  
  function respond(res, promise){
    promise.then(data => {
      if(data){
        res.set('content-type', 'application/json');
        res.json(data); //send json back to client
      } else {
        res.set('content-type', 'application/json');
        res.json({}); //send json back to client
        //res.end(); //or close
      }
    }).catch(err => {
      res.set('content-type', 'application/json');
      res.status(400).send(JSON.stringify({error: err.toString()})); //send json back to client
    });
  }
  
  function deny(res, info){
      res.set('content-type', 'application/json');
      res.status(400).send(JSON.stringify(info)); //send json back to client
  }
  
  
  /**
   * test endpoint
   * @param {String} userId
   * @param {Object} data
   */
  app.get('/api/test/:data', (req, res) => {
    return respond(res, api.getTest(req.user.id, req.params.data));
  });
  api.getTest = (userId, data) => {
    console.log('TEST GET:', userId, data);
    return Promise.resolve(userId);
  }
  
  /**
   * test endpoint
   * @param {String} userId
   * @param {Object} data
   */
  app.post('/api/test/:data', (req, res) => {
    return respond(res, api.postTest(req.user.id, req.params.data, req.body));
  });
  api.postTest = (userId, data, body) => {
    console.log('TEST POST:', userId, data, body);
    return Promise.resolve({data, userId, body});
  }
  
  /**
   * spawns a creature and puts it into a user's inventory
   * @param {String} userId
   * @param {String} creatureId
   * @rights admin
   */
  app.post('/api/spawn/:id', (req, res) => {
    if(!rights.check(req.user, 'admin')){
      return deny(res, "you don't have permission to do that");
    }
    return respond(res, api.spawnCreature(req.user.id, req.params.id));
  });
  api.spawnCreature = (userId, creatureId) => {
    return gameHelper.spawnCreature(userId, creatureId);
  }
  
  /**
   * moves a creature from the availible pool into a user's inventory
   * @param {String} userId
   * @param {String} biome
   */
  app.post('/api/catch/:biome', (req, res) => {
    if(!rights.check(req.user, 'admin')){
      return deny(res, "you don't have permission to do that");
    }
    return respond(res, api.catchCreature(req.user.id, req.params.biome));
  });
  api.catchCreature = (userId, biome) => {
    return gameHelper.catchCreature(userId, biome);
  }
  
  /**
   * moves a creature from the availible pool into a user's inventory
   * @param {String} userId
   * @param {String} biome
   */
  app.post('/api/catchSilhouette/:biome/:id', (req, res) => {
    return respond(res, api.catchSilhouette(req.user.id, req.params.biome, req.params.id));
  });
  api.catchSilhouette = (userId, biome, id) => {
    return gameSetup.then(() => {
      return gameHelper.catchSilhouette(userId, biome, id);
    });
  }
  
  /**
   * removes a creature from a user's collection
   * @param {id} userId
   * @param {id} creatureId
   * @rights admin
   */
  app.post('/api/release/:id', (req, res) => {
    if(!rights.check(req.user, 'admin')){
      return deny(res, "you don't have permission to do that");
    }
    return respond(res, api.releaseCreature(req.user.id, req.params.id));
  });
  api.releaseCreature = (userId, creatureId) => {
    return gameHelper.releaseCreature(userId, creatureId);
  }
  
  /**
   * manually renews the creature batch for a biome
   * @param {String} userId
   * @param {String} biome
   * @rights admin
   */
  app.post('/api/renewbatch/:biome', (req, res) => {
    if(!rights.check(req.user, 'admin')){
      return deny(res, "you don't have permission to do that");
    }
    return respond(res, api.renewBatch(req.params.biome));
  });
  api.renewBatch = (biome) => {
    return gameHelper.renewBatch(biome);
  }
  
  /**
   * get the gloablSettings object
   * @rights admin
   */
  app.get('/api/globalsettings', (req, res) => {
    if(!rights.check(req.user, 'admin')){
      return deny(res, "you don't have permission to do that");
    }
    return respond(res, api.getGlobalSettings());
  });
  api.getGlobalSettings = () => {
    return Promise.resolve(globalSettings.list());
  }
  
  /**
   * set setting in the gloablSettings object
   * @rights admin
   */
  app.post('/api/globalsettings', (req, res) => {
    if(!rights.check(req.user, 'admin')){
      return deny(res, "you don't have permission to do that");
    }
    return respond(res, api.setGlobalSettings(req.body.path, req.body.value));
  });
  api.setGlobalSettings = (path, value) => {
    console.log(path, value)
    return Promise.resolve(globalSettings.set(path, value));
  }
  
  /**
   * get the creatures for the current user
   */
  app.get('/api/creatures', (req, res) => { //current user
    return respond(res, api.getUserCreatures(req.user.id, req.body.populatePath));
  });
  app.get('/api/creatures/:user', (req, res) => { //any user
    return respond(res, api.getUserCreatures(req.params.user, req.body.populatePath));
  });
  api.getUserCreatures = (userResolvable, populatePath) => {
    return userHelper.getCreatures(userResolvable, populatePath);
  }
  
  /**
   * get a user
   */
  app.get('/api/user', (req, res) => { //current user
    return respond(res, api.getUser(req.user.id, req.body.populatePath));
  });
  app.get('/api/user/:user', (req, res) => { //any user
    return respond(res, api.getUser(req.params.user, req.body.populatePath));
  });
  api.getUser = (userResolvable, populatePath) => {
    return userHelper.getPublicUser(userResolvable, populatePath);
  }
  
  /**
   * get a biome's silhouettes
   * @rights admin
   */
  app.get('/api/silhouettes/:biome', (req, res) => {
    if(!rights.check(req.user, 'admin')){
      return deny(res, "you don't have permission to do that");
    }
    return respond(res, api.getSilhouette(req.params.biome, req.body.populatePath));
  });
  api.getSilhouette = (biome, populatePath) => {
    return gameSetup.then(() => {
      return gameHelper.getSilhouettes(biome, populatePath);
    });
  }
  
  return api;
}