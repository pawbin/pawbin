/**
 * test.js
 * used to test server methods
 */

// let globalSettings = require('./config/globalSettings.js');
// let utility = require('./app/utility.js');
// let creature = require('./app/models/creature.js');
// let creatureType = require('./app/models/creatureType.js');
// let game = require('./app/game/game.js');
// let MemoryStore = require('./app/memoryStore.js');

/*
creatureType.findOne({}).lean().exec((err, obj) => {
  console.log(err, obj);
  if(err){
    return;
  }
  
  obj._id = obj._id.toString(); //remove mongoose methods
  
  let creatureStore = new MemoryStore(obj, (compiled) => {
    console.log('[[BACKING UP]]');
    console.log(compiled);
    creatureType.findOneAndUpdate({_id: compiled._id}, compiled, {new: true}).exec((err, saved) => {
      if(err){
        return console.error(err);
      }
      console.log('[[SAVED]]', saved);
    });
  }, {throttleDelay: 100});
  
  creatureStore.rarity = 7;
  creatureStore.rarity = 8;
  creatureStore.rarity = 1;
  
});
*/

// console.log('============');

// console.log(game);

// game.setup().then(() => {
//   console.log(game);
// })


/*
let a = (new Array(40)).fill(0).map((v,i) => 20+i);

console.log(utility.getCodename(1));
console.log(utility.getSafeCodename(1));
console.log(utility.getCodename(1));
console.log(utility.getSafeCodename(1));

a.forEach((index) => {
  console.log({index})
  console.log(utility.getCodename(index));
  console.log(utility.getSafeCodename(index));
});

creature.findOne({}).sort('-index').exec(console.log);
*/

/*
globalSettings.update();

console.log(globalSettings);
console.log(globalSettings.test.a);
console.assert(globalSettings.test.a === 1);
console.log(globalSettings.test.b);
console.assert(globalSettings.test.b === 2);

globalSettings.set('test.a', 3);
console.log(globalSettings.test.a);
console.assert(globalSettings.test.a === 3);

globalSettings.set('test.a', [1,2,3]);
console.log(globalSettings.test.a);
console.assert(JSON.stringify(globalSettings.test.a) === JSON.stringify([1,2,3]));

globalSettings.set('test.a[1]', 5);
console.log(globalSettings.test.a);
console.log(JSON.stringify(globalSettings.test.a), JSON.stringify([1,5,3]))
console.assert(JSON.stringify(globalSettings.test.a) === JSON.stringify([1,5,3]));

globalSettings.set('test.a', 1);
console.log(globalSettings.test.a);
console.assert(globalSettings.test.a === 1);
*/

/*
setTimeout(()=>{
  console.log('get compiled game');
  const game = require('./app/game/game.js');
  
  console.log(game instanceof Promise);
  
  game.then(v => {
    console.log('done', v instanceof Promise);
  });
  
},0);


setTimeout(()=>{
  console.log('get compiled game');
  const game = require('./app/game/game.js');
  
  console.log(game instanceof Promise);
  
  game.then(v => {
    console.log('done', v instanceof Promise);
  });
  
}, 4000);
*/


/*
let userHelper = require('./app/site/userHelper.js');
let gameStore = require('./app/game/gameStore.js');

let gameHelper;
gameStore.then(game => {
  gameHelper = require("./app/game/gameHelper.js")(game);
})

userHelper.getUser('torcado').then(user => {
  // user.populate('creaturesRef', (err, newUser) => {
  //   console.log({newUser});
  // });
  // user.save((err, saved) => {
  // });
  gameStore.then(() => {
    gameHelper.spawnCreature(user, 1).then(console.log);
  });
});
*/

/*
let utility = require('./app/utility/utils.js');

console.log('1', utility.merge(['user.weapon.mater ials', 'user.weapon.name']));
console.log('2', utility.merge('user.inventory.offhand'));


const mongoose = require('mongoose');

const populate = require('./app/utility/populate.js');


setInterval(() => {
  mongoose;
  utility;
  userHelper;
  populate;
  userHelper.getUser('torcado').then(user => {
    let a = populate.request(user, 'creaturesRef.ownerRef.creaturesRef.creatureTypeRef').then(doc => {
      console.log(doc);
    }).catch(console.error);
  })
}, 2000);

*/

/*
let utility = require('./app/utility/utils.js');
let lastCodename;
setTimeout(() => {
  for(let i = 0; i < 1000; i++){
    let cn = utility.getSafeCodename(i),
        name = cn.name;
    if(name === lastCodename){
      debugger;
    }
    console.log(cn);
    lastCodename = name;
  }
}, 1000)
*/
