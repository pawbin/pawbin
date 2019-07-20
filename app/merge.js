/**
 * app/merge.js
 * merge paths into an object tree
 * @param {array} paths - array of strings or arrays, paths to be merged into a tree
 * @param {string} delimiter - if paths is an array of strings, this is delimiter between items. defaults to "."
 */
function merge(paths, delimiter){
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

module.exports = merge;