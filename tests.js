/**
 * test.js
 * used to test server methods
 */

let globalSettings = require('./config/globalSettings.js');

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