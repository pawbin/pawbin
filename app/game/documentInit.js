const mongoose     = require('mongoose'),
      User         = require('../models/user.js'),
      CreatureType = require('../models/creatureType.js'),
      Game         = require('../models/game.js'),
      Biome        = require('../models/biome.js'),
      serverHelper = require('../site/serverHelper.js');

//create biomes
let biomeDefs = require('./biomeDefs.json');

let biomeIds = [];

let count = biomeDefs.length;

biomeDefs.forEach(biomeDef => {
  Biome.findOne({index: biomeDef.index}).exec((err, biome) => {
    if(err){
      return console.error(err);
    }
    if(biome){
      biome.set(biomeDef);
      biome.save(cb);
    } else {
      let doc = new Biome(biomeDef);
      doc.save(cb);
    }
    function cb(err, saved){
      if(err){
        return console.error(err);
      }
      biomeIds[biomeDef.index-1] = saved._id; //kinda weird, but this should costruct a full array of biomes ordered by their index
      count--;
      if(count <= 0){
        initGame();
      }
    }
  });
});

function initGame(){
  //create Game
  Game.findOne({}).exec((err, gameDoc) => {
    if(err){
      return console.error(err);
    }
    if(!gameDoc){
      let newGame = new Game();
      
      newGame.biomes = biomeIds;
      
      newGame.save();
    }
  });
}



//fill creatures
let creatureTypeDefs = require('./creatureTypeDefs.json');

creatureTypeDefs.forEach(creatureTypeDef => {
  console.log(creatureTypeDef.index, creatureTypeDef.name);
  CreatureType.findOne({index: creatureTypeDef.index}).exec((err, creatureType) => {
    if(err){
      return console.error(err);
    }
    if(creatureType){
      creatureType.set(creatureTypeDef);
      creatureType.save();
    } else {
      let doc = new CreatureType(creatureTypeDef);
      doc.save();
    }
  });
});