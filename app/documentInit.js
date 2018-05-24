const mongoose     = require('mongoose'),
      User         = require('../app/models/user'),
      Creature     = require('../app/models/creature'),
      serverHelper = require('../app/serverHelper');
      
      
//fill creatures

//Frizzbee
Creature.findOne({'index': 1}, function(err, creature) {
  if(!creature){
    let creature = new Creature({
      index: 1,
      name: "Frizzbee",
      image: "https://cdn.glitch.com/5dce4cb1-f48b-44b6-92cc-e338cf68eb7f%2FFlWAX7r.png",
      biome: 5,
      bodyType: "Bee?",
      flavorText: "Bee.",
      rarity: 1,
      creator: {
        name: "Sheepon",
        userId: serverHelper.getUser("Sheepon")._id
      }
    });
    
    //creature.save(console.error);
  }
});

//Pupsicle
Creature.findOne({'index': 2}, function(err, creature) {
  if(!creature){
    let creature = new Creature({
      index: 2,
      name: "Pupsicle",
      image: "https://cdn.glitch.com/5dce4cb1-f48b-44b6-92cc-e338cf68eb7f%2FNL7BfuH.png",
      biome: 4,
      bodyType: "Canine",
      flavorText: "Occasionally mischevious young magicians will practice their ice spells on the local stray dog population. How cruel!",
      rarity: 2,
      creator: {
        name: "Sheepon",
        userId: serverHelper.getUser("Sheepon")._id
      }
    });
    
    //creature.save(console.error);
  }
});