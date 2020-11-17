const Silhouette     = require('../models/silhouette.js');
const globalSettings = require('../../config/globalSettings.js');
const populate       = require('../utility/populate.js');
const socket         = require('../site/socket.js');
const io = socket.getIo();

module.exports = (game) => {
  const gameHelper = require('../game/gameHelper.js')(game);
  
  return function SilhouetteController(biome, active = true, tickrate = 1000){ //TODO: change tickrate
    this.biome = biome;
    this.biomeName = biome.name;
    this.active = active;
    this.tickrate = tickrate;
    
    let self = this;
    
    self.ready = false;
    self.activeSilhouettes = [];
    self.pendingCount = 0;
    
    self.init = () => {
      //console.log(game);
      Silhouette.find({ '_id': { $in: game[self.biome].silhouettes } }).exec((err, silhouettes) => {
        self.activeSilhouettes = silhouettes; //references
        self.ready = true;
        //start cron
        self.updateInterval = setInterval(self.update, self.tickrate);
      });
    }
    
    
    self.update = (time) => {
      self.checkExpired();
      self.fillSlots();
    }
    
    self.checkExpired = () => {
      //TODO: check expire times for active silhouettes, send remove event
    }
    
    self.fillSlots = () => {
      if((self.activeSilhouettes.length + self.pendingCount) < globalSettings.game.silhouetteCount){
        for(let i = 0; i < globalSettings.game.silhouetteCount - (self.activeSilhouettes.length + self.pendingCount); i++){
          self.sendNewSilhouette();
        }
      }
    }
    
    
    self.sendSilhouette = (silhouette) => {
      self.activeSilhouettes.push(silhouette);
      populate.request(silhouette, 'creatureRef.creatureTypeRef').then(sil => {
        io.of('/biome/grassland').emit('newSilhouette', sil);
        self.pendingCount--;
      }).catch(console.error)
      self.updateDB();
      //TODO: differentiate activeSilhouettes and game[biome].silhouettes somehow
      //TODO: websocket emit, send silhouette object (or cherrypick necessary properties and send as an object);
    }
    
    self.sendNewSilhouette = () => {
      self.pendingCount++;
      self.createSilhouette()
        .then(self.sendSilhouette)
        .catch(console.error);
    }
    
    self.createSilhouette = (creatureType) => {
      return new Promise((resolve, reject) => {
        if(!creatureType){
          let grabbedCreatureType = gameHelper.grabCreatureTypeFromBatch(self.biome)
          creatureType = grabbedCreatureType;
        }
        let creature = gameHelper.generateCreature(creatureType);
        creature.save((err, savedCreature) => {
          if(err){
            return reject(err);
          }
          let silhouette = new Silhouette({
            creatureRef: creature._id,
            duration: 5 /*creature.stats.speed*/,
            biome: self.biome,
            /*image: String,*/
          });
          console.log('creating silhouette:', self.biome, silhouette.creatureRef)
          silhouette.save((err, savedSilhouette) => {
            if(err){
              return reject(err);
            }
            return resolve(savedSilhouette);
          });
        });
      });
    }
    
    
    self.catchSilhouette = (id) => {
      //NOTE: this could be a map for easier targetting?
      //find, splice matching silhouette from list
      //let caught = self.activeSilhouettes.find(v => v._id === id);
      if(!id){
        throw new Error('no id specified');
      }
      let caught = self.activeSilhouettes.find(v => v.id === id);
      if(!caught){
        throw new Error('no silhouette found with that id');
      }
      self.activeSilhouettes.splice(self.activeSilhouettes.indexOf(caught), 1);
      self.updateDB();
      if(self.activeSilhouettes.length < globalSettings.game.silhouetteCount){
        self.sendNewSilhouette();
      }
      return caught;
    }
    
    self.updateDB = () => {
      game[self.biome].silhouettes = self.activeSilhouettes.map(s => s.id);
    }
    
    self.init();
  }
  
  
};
