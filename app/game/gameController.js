const io = require('../site/socket.js');


let controller = {};

let called = false;

//TODO: initialize silhouetteControllers for 12 biomes, set up crons for switching days/months
module.exports = (game) => {
  
  if(called){
    return controller;
  }
  called = true;
  
  const SilhouetteController = require('../game/silhouetteController.js')(game);
  
  controller.silhouetteControllers = {};
  
  game.biomeStores.forEach(biome => {
    //console.log(biome);
    if(biome.name === 'grassland'){ //just for now
      console.log('starting silhouetteController for', biome.name)
      controller.silhouetteControllers[biome.name] = new SilhouetteController(biome.name);
    }
  });
  
  controller.getSilhouettes = (biome) => {
    if(!controller.silhouetteControllers[biome]){
      throw new Error('no silhouetteController for that biome');
    }
    return controller.silhouetteControllers[biome].activeSilhouettes;
  }
  
  controller.catchSilhouette = (biomeOrId, silhouetteId) => {
    if(!biomeOrId){
      throw new Error('no id specified');
    }
    if(silhouetteId){
      if(!controller.silhouetteControllers[biomeOrId]){
        throw new Error('no silhouetteController for that biome');
      }
      return controller.silhouetteControllers[biomeOrId].catchSilhouette(silhouetteId);
    } else {
      //look for matching silhouette
      throw new Error('not yet implemented');
    }
  }
  
  return controller;
}
