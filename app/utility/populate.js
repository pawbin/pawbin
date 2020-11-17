const mongoose = require('mongoose');
const { merge } = require('./utils.js');

let populate = {};

populate.compile = (schema, path) => {
  //TODO: check edge-cases like ending with a non-ref path? i think this works already though
  if(!path || (Array.isArray(path) && path.length === 0) || (Object.keys(path).length === 0)){
    return [];
  }
  //path types:
  // 1. string with dot delimeter
  // 2. array of such strings
  // 3. pre-made path tree (exactly what utility.merge returns)
  path = merge(path);
  
  //recursively travel down tree
  // start with a blank path set, pass it into the function along with the current tree level (cursor)
  let populateTree = [];
  function next(schema, pathCursor, populateCursor, pathSet){
    //test current compiled dot-path against schema.paths[path].options.ref
    // if ref, push current path to parent populates, then split off another populate list
    // if not ref, add current pathname to current path set
    let ref = getRef(schema, pathSet);
    if(ref){
      populateCursor.push({
        path: pathSet, 
        populate: (populateCursor = [])
      });
      pathSet = '';
      schema = mongoose.modelSchemas[ref];
    } else {
      pathSet += '.';
    }
    // if pathSet ends at a blank object that is a non-ref, the whole current pathSet should be removed
    if(Object.keys(pathCursor).length === 0){
      return false;
    }
    let i = 0;
    for(let key in pathCursor){
      let ret = next(schema, pathCursor[key], populateCursor, pathSet + key);
      if(!ret && populateCursor[i]){
        delete populateCursor[i].populate;
      }
      i++;
    }
    return true;
  }
  
  for(let key in path){
    next(schema, path[key], populateTree, key);
  }
  
  //should end up with a {populate: {path: {}, populate: { ... }}} like object
  return populateTree;
}

populate.request = (document, path) => {
  return new Promise((resolve, reject) => {
    document.populate(populate.compile(document.schema, path), (err, doc) => {
      if(err){
        return reject(err);
      }
      return resolve(doc);
    });
  });
}

function getRef(schema, path){
  if(schema.paths[path] && schema.paths[path].options){ //prevent errors
    if(schema.paths[path].options.ref){ //is reference, populate
      return schema.paths[path].options.ref;
    }
    if(Array.isArray(schema.paths[path].options.type) && schema.paths[path].options.type[0]){ //check if array, and first child is ref. if so, populate. this can cause false positives but a solution is unnecessarily complex.
      let set = schema.paths[path].options.type[0];
      if(set.ref){
        return set.ref;
      }
      //????????????????????? this doesnt make sense
      for(let prop in set){ //populate every child of the main object in the array, if they are refs
        if(set[prop].ref){
          return set[prop].ref;
        }
      }
    }
  }
  return false;
}

module.exports = populate;