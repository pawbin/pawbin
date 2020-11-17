const random = require('random-seed');

let utility = {};

/**
 * Generates the codename for a creature given its index
 * @param {number} index 
 * @returns {string} codename
 */
const CHARSET = 'abcdefghijklmnopqrstuvwxyz'.split('');
//let alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
let coprimes = [17, 499, 10861, 293269, 6131473, 38581661];
utility.getCodename = function(index){
  let alphabet = [...CHARSET];
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

const bannedWords = [
  'ho',
  'eh'
];

utility.getSafeCodename = (index) => {
  let safeName = '';
  do{
    safeName = utility.getCodename(index);
    index++;
  } while(bannedWords.includes(safeName));
  return {name: safeName, index: index-1};
}

/**
 * fills a templated string with data
 * @param {string} template - use ${THIS} format for placeholders 
 * @param {Object} data - properties of this object match with the placeholder names: data.THIS = "that"
 */
utility.fill = (template, data) => {
  let r = /\${(.+?)}/gm,
      match;
  while(match = r.exec(template)){
    template = template.substring(0, match.index) + data[match[1]] + template.substring(match.index + match[0].length);
  }
  return template;
}

/**
 * merge paths into an object tree
 * @param {array} paths - string or array of strings or arrays, paths to be merged into a tree
 * @param {string} delimiter - if paths is an array of strings, this is delimiter between items. defaults to "."
 */
utility.merge = (paths, delimiter) => {
  if(typeof paths === 'object' && !Array.isArray(paths)){
    return paths; //already a tree object
  }
  if(typeof paths === 'string'){
    paths = [paths];
  }
  let tree = {},
      cursor = {};
  if(paths[0] && !Array.isArray(paths[0])){
    paths = paths.map(item => item.split(delimiter || "."));
  }
  for(let i = 0; i < paths.length; i++){
    let path = paths[i];
    cursor = tree;
    for(let j = 0; j < path.length; j++){
      cursor = cursor[path[j]] || (cursor[path[j]] = {});
    }
  }
  return tree;
}

/**
 * returns specific fields from an object
 * @param {array} obj - original object
 * @param {string} paths - string or array of strings or object structure
 */
utility.pick = (obj, paths) => {
  let ref = utility.merge(paths),
      newObj = {},
      cursor = {};
  function next(obj, ref, newObj){
    for(let key in obj){
      if(ref[key]){
        if(Array.isArray(obj[key]) && Array.isArray(ref[key]) && ref[key].length === 0){
          newObj[key] = obj[key];
        } else if(typeof obj[key] === 'object'){
          newObj[key] = {};
          next(obj[key], ref[key], newObj[key]);
        } else {
          newObj[key] = obj[key];
        }
      }
    }
  }
  next(obj, ref, newObj);
  return newObj;
}

module.exports = utility;