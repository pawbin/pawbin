const random = require('random-seed');

let utility = {};

/**
 * Generates the codename for a creature given its index
 * @param {number} index 
 * @returns {string} codename
 */
let alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
//let alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
let coprimes = [17, 499, 10861, 293269, 6131473, 38581661];
utility.getCodename = function(index){
  //find length of name, which is this stupid dumb formula
  let nameLength = Math.floor(Math.log((alphabet.length - 1) * index + alphabet.length) / Math.log(alphabet.length));
  
  //pull the index down by sum of 26^n-1 to 0
  let pulledIndex = index - (Math.pow(alphabet.length, nameLength - 1) - alphabet.length) / (alphabet.length - 1);
  
  //seeded random number generator with seed being the length of the name
  // (once we hit index 27, the order will be different than it was for indeces 1-26)
  let gen = random.create(nameLength);
  
  //randomize order
  for(let i = alphabet.length - 1; i > 0; i--){
    let j = Math.floor(gen.random() * (i + 1));
    [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
  }
  
  //generate sring of length n
  function string(index, n){
    
    //get nth coprime from list
    let coprime = coprimes[n - 1];
    
    //shift index by coprime
    index = ((index * coprime) + coprime) % Math.pow(alphabet.length, n);
    
    //generate string
    let name = '';
    for(let c = 0; c < n; c++){
      name += alphabet[(Math.floor(index / Math.pow(alphabet.length, c))) % alphabet.length];
    }
    return name;
  }
  
  //call string with new index and namelength, and return it
  return string(pulledIndex, nameLength);
}

module.exports = utility;