const Game = require('../models/game.js');
const Biome = require('../models/biome.js');

//create game and biome db documents if there are none
require('../game/documentInit.js');

const gameStore = require('./gameStore.js');

let resolve, reject;

let setupPromise = new Promise((res, rej) => {
  resolve = res;
  reject = rej;
});

gameStore.then(game => {
  //startup game scripts, passing in the game MemoryStore
  let attempts = 3;
  function load(){
      console.log('load!')
    require('../game/gameController.js')(game);
  }
  function attempt(){
    console.log('attempt:', attempts)
    try{
      load();
    } catch(err) {
      console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
      console.log(err);
      console.log(attempts);
      if(attempts > 0){
        attempts--;
        attempt();
      }
    }
  }
  attempt();
  resolve(game);
}).catch(err => {
  console.error(err);
  reject(err);
});

module.exports = setupPromise;