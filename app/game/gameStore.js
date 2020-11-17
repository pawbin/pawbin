let Game = require('../models/game.js');
let Biome = require('../models/biome.js');
let CreatureType = require('../models/creatureType.js');
let MemoryStore = require('../memoryStore.js');

const mongoose = require('mongoose');

module.exports = new Promise((resolve, reject) => {
  
  Game.findOne({}).exec((err, gameDoc) => {
    //console.log(err, gameDoc);
    if(err){
      return reject(err);
    }
    
    if(!gameDoc){
      return;
    }
    
    let gameObject = JSON.parse(JSON.stringify(gameDoc.toJSON())); //dumb but its exactly what i want so. toJSON might not be necessary?
    
    gameObject.__v = undefined;
    
    //gameObject._id = gameObject._id.toString(); //remove mongoose methods
    let gameStore = new MemoryStore(gameObject, (compiled) => {
      gameDoc.set(compiled);
      gameDoc.save();
      // game.findOneAndUpdate({_id: compiled._id}, compiled, {new: true}).exec((err, saved) => {
      //   if(err){
      //     return reject(err);
      //   }
      //   console.log('[[SAVED]]', saved);
      // });
    }, {throttleDelay: 100});
    
    gameStore.biomeStores = [];
    
    
    
    //now for extra components
    
    Biome.find({}).sort('index').exec((err, biomeDocs) => {
      if(err){
        return reject(err);
      }
      if(biomeDocs.length === 0){
        return;
      }
      biomeDocs.forEach(biomeDoc => {
        if(!biomeDoc){
          return;
        }
        let biomeObject = JSON.parse(JSON.stringify(biomeDoc.toJSON()));
        
        biomeObject.__v = undefined;
        
        gameStore[biomeObject.name] = new MemoryStore(biomeObject, (compiled) => {
          biomeDoc.set(compiled);
          biomeDoc.save((err, saved) => {
            console.log(err, saved, saved && saved.__v);
            if(err){
              debugger;
            }
          })
          // biome.findOneAndUpdate({_id: compiled._id}, compiled, {new: true}).exec((err, saved) => {
          //   if(err){
          //     return reject(err);
          //   }
          //   console.log('[[SAVED]]', saved);
          // });
        }, {throttleDelay: 800});
        
        gameStore.biomeStores.push(gameStore[biomeObject.name]);
        
      });
      fin();
    });
    
    CreatureType.find({}).sort('index').exec((err, creatureTypeDocs) => {
      if(err){
        return reject(err);
      }
      if(creatureTypeDocs.length === 0){
        return;
      }
      creatureTypeDocs = creatureTypeDocs.map(creatureTypeDoc => {
        let doc = JSON.parse(JSON.stringify(creatureTypeDoc.toJSON()));
        doc.__v = undefined;
        return doc;
      });
      gameStore.creatureTypes = new MemoryStore(creatureTypeDocs, (compiled) => {
        creatureTypeDocs.set(compiled);
        creatureTypeDocs.save();
      }, {throttleDelay: 100});
        
      fin();
    });
    
    let count = 2;
    
    function fin(){
      count--;
      if(count == 0){
        return resolve(gameStore)
      }
    }
    
  });
  
});
