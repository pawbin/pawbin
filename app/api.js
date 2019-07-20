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
const serverHelper = require('../app/serverHelper');
const gameHelper   = require('../app/gameHelper');
const rights       = require('../app/rights');

module.exports = app => {
  if(!app){
    app = {get(){},post(){}}; //catch all enpoint setups without app
  }
  
  let api = {};
  
  function respond(res, promise){
    promise.then(data => {
      res.set('content-type', 'application/json');
      res.send(JSON.stringify(data)); //send json back to client
    }).catch(err => {
      res.set('content-type', 'application/json');
      res.status(400).send(JSON.stringify(err)); //send json back to client
    });
  }
  
  function deny(res, info){
      res.set('content-type', 'application/json');
      res.status(400).send(JSON.stringify(info)); //send json back to client
  }
  
  
  /**
   * test endpoint
   * @param {id} userId
   * @param {id} data
   */
  app.get('/test/:data', (req, res) => {
    return respond(res, api.getTest(req.user.id, req.params.data));
  });
  api.getTest = (userId, data) => {
    console.log('TEST GET:', userId, data);
    return Promise.resolve(userId);
  }
  
  /**
   * test endpoint
   * @param {id} userId
   * @param {id} data
   */
  app.post('/test/:data', (req, res) => {
    return respond(res, api.postTest(req.user.id, req.params.data, req.body));
  });
  api.postTest = (userId, data, body) => {
    console.log('TEST POST:', userId, data, body);
    return Promise.resolve({data, userId, body});
  }
  
  /**
   * moves a creature from the availible pool into a user's inventory
   * @param {id} userId
   * @param {id} creatureId
   * @rights admin
   */
  app.post('/catch/:id', (req, res) => {
    if(!rights.check(req.user, 'admin')){
      return deny(res, "you don't have permission to do that");
    }
    return respond(res, api.catchCreature(req.user.id, req.params.id));
  });
  api.catchCreature = (userId, creatureId) => {
    return gameHelper.catchCreatureInstance(userId, creatureId);
  }
  
  /**
   * reoves a creature from a user's collection
   * @param {id} userId
   * @param {id} creatureId
   * @rights admin
   */
  app.post('/release/:id', (req, res) => {
    if(!rights.check(req.user, 'admin')){
      return deny(res, "you don't have permission to do that");
    }
    return respond(res, api.releaseCreature(req.user.id, req.params.id));
  });
  api.releaseCreature = (userId, creatureInstanceId) => {
    return gameHelper.releaseCreatureInstance(userId, creatureInstanceId);
  }
  
  return api;
}