const path = require('path');
const fs   = require('fs');

//const serverHelper = require('../app/serverHelper');
const merge = require('../app/merge');

let models = {};

fs.readdirSync(path.join(__dirname, "..", 'app', 'models')).forEach((file) => {
  models[file.replace(/\..+?$/, "").toLowerCase()] = require('../app/models/' + file);
});

function getQuery(keyword, params, req, res){
  switch (keyword) {
    case "User":
      if(req.user){
        return {
          model: models.user,
          query: models.user.findOne({'local.username': req.user.local.username})
        };
      } else {
        return {model: null, query: null};
      }
      break;
    case "PageUser":
      let id = req.url.split("/").pop();
      return {
        model: models.user,
        query: models.user.findOne({$or: [{'local.username': id}, {'_id': id}]})
      };
      break;
    case "PageCreature":
      return {
        model: models.creature,
        query: models.creature.findOne()
      };
      break;
    default:
      return {model: null, query: null};
      break;
  }
}

// deep populates must be set up like so: query.populate({path: "some.path", populate: {path: "pop1", populate: {path: "pop2"}}})

module.exports = () => {
  return function(req, res, next) {
    res.preRender = (file, data) => {
      let content = fs.readFileSync(path.join(__dirname, '..views/pages/', file + (file.includes(".html") ? "" : ".html")), 'utf-8'),
          requests = content.match(/_DB\.[^ ]+/g), //eg. ["_DB.creature.creator.user.local.username"]
          result = {
            _DB: {}
          },
          count = 0;
      
      if(!requests){
        result = {};
        return finish();
      }
      
      requests = merge(requests)._DB;
      count = Object.keys(requests).length;
      
      for(let key in requests){
        let {model, query} = getQuery(key, null, req, res),
            populates = [];
        
        if(!model || !query){
          result._DB[key] = null;
          count--;
          if(count === 0){
            return finish();
          }
          continue;
        }
        
        function check(branch, path, model){
          for(let key in branch){
            // check ref for path + "." + key
            // if so, change model to ref and add to populates
            // continue inward
            let newPath = path ? path + "." + key : key;
            let newModel = getRef(model, newPath);
            if(newModel){
              model = models[newModel.toLowerCase()];
              populates.push(newPath);
              newPath = "";
            }
            if(Object.keys(branch[key]).length > 0){
              check(branch[key], newPath, model);
            }
          }
        }
        check(requests[key], "", model);
        
        //setup populate then exec query
        populate(query, populates);
        query.exec((err, res) => {
          if(err){
            console.error(err);
          } else {
            result._DB[key] = res;
          }
          count--;
          if(count === 0){
            return finish();
          }
        });
        
      }
      
      function finish(){
        res.render(file, {...data, ...result});
        return;
      }
    }
    
  }
}


function populate(query, paths){
  if(paths.length > 0){
    let tree = {},
        cursor = tree;
    for(let i = 0; i < paths.length; i++){
      cursor = cursor.populate = {}
      cursor.path = paths[i];
    }
    query.populate(tree.populate);
  }
}

function getRef(model, path){
  if(model.schema.paths[path] && model.schema.paths[path].options){ //prevent errors
    if(model.schema.paths[path].options.ref){ //is reference, populate
      return model.schema.paths[path].options.ref;
    }
    if(Array.isArray(model.schema.paths[path].options.type) && model.schema.paths[path].options.type[0]){ //check if array, and first child is ref. if so, populate. this can cause false positives but a solution is too complex.
      let set = model.schema.paths[path].options.type[0];
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