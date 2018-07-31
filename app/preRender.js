const path = require('path');
const fs   = require('fs');

const serverHelper = require('../app/serverHelper');
const merge = require('../app/merge');

let models = {};

fs.readdirSync(path.join(__dirname, "..", 'app', 'models')).forEach((file) => {
  models[file.replace(/\..+?$/, "")] = require('../app/models/' + file);
});

module.exports = function(options) {
  return function(req, res, next) {
    
    //console.log(get('user'));
    
    //TODO: change this from list of separate requests (_DB.creature.creator.user.local.username, _DB.creature.creator.user.creatures)
    // to combined list of branches (_DB.creature.creator.user.local.(username && email))
    // which can be done by merging requests into a single object:
    // requests: {
    //   creature: {
    //    creator: {
    //      user: {
    //        local: {
    //          email: {}
    //        },
    //        creatures: {}
    //      }
    //    }
    //   }
    // }
    // or
    // requests: {
    //   creature: {
    //    creator: {
    //      user: {
    //        local: ["email",
    //        "creatures"]
    //      }
    //    }
    //   }
    // }
    //
    
    
    res.preRender = function(file, data){
      let content = fs.readFileSync(path.join(__dirname, "..", 'views', file + (file.indexOf(".html") >= 0 ? "" : ".html")), 'utf-8'),
      //let requests = content.match(/(_DB\..+?) /g); //eg. ["_DB.creature.creator.user.local.username"]
          requests = content.match(/_DB\.[^ ]+/g), //eg. ["_DB.creature.creator.user.local.username"]
          queries = [],
          result = {
            _DB: {}
          },
          count = 0;
          
      console.log("a?")
      console.log("requests: ", requests)
      
      if(!requests){
        result = {};
        return finish();
      }
      
      requests = merge(requests)._DB;
      count = Object.keys(requests).length;
      
      console.log(requests);
      console.log(Object.keys(requests).length);
      
      //TODO: this needs to be reworked
      // say you have a request, "_DB.creature.creator.user.creatures"
      // this requests had 2 required populates, user and creatures
      // this is possible in mongoose, i can creature.populate({path: "creator.user", populate: {path: "creatures"}})
      // but this function checks the schema before populating to prevent unnecessary population. eg. when a field is not a reference, dont populate (you can't)
      // to do this, i can't just do query.populate(path), i need to make an entirely new object with a tree for population, which looks like the one above
      // basically, each "populate" key will have a "path" key with a value that is the path until the next model.
      // so, creator.user points to a reference to a different model. then we start a new {populate: {path: ""}} where path is the entire path tree until it finds the next reference to a different model
      // i can save an array of populates like ["creator.user", "creatures"] and generate the populate object off of it like {path: "creator.user", populate: {path: "creatures"}}
      // this is probably exactly what the monngoose plugin "deep-populate" does: https://github.com/buunguyen/mongoose-deep-populate
      // but i can also try to do it myself. it will be faster without the overhead for options, etc.
      
      for(let key in requests){
        let {model, query} = get(key),
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
            // if so, change model to ref 
            // continue inard
            let newPath = path ? path + "." + key : key;
            let newModel = isRef(model, newPath);
            if(newModel){
              model = models[newModel.toLowerCase()];
              populates.push(newPath);
              newPath = "";
            }
            if(Object.keys(branch[key]).length){
              check(branch[key], newPath, model);
            }
          }
        }
        check(requests[key], "", model);
        
        console.log("FINAL", populates);
        populate(query, populates);
        query.exec((err, res) => {
          count--;
          if(err){
            console.error(err);
          } else {
            result._DB[key] = res;
          }
          if(count === 0){
            return finish();
          }
        });
        
      }
      
      
      function finish(){
        console.log("========");
        console.log(queries);
        console.log(result);
        // console.log("{{ _DB.user.creatures | dump }}", result._DB.user.creatures);
        // console.log("{{ _DB.creature.creator.user.username | dump }}", result._DB.creature.creator.user.local.username);
        // console.log("{{ _DB.creature.creator.user.creatures | dump }}", result._DB.creature.creator.user.creatures);
        res.render(file, {...data, ...result});
        return;
      }
      
      /*
      for(let i = 0; i < requests.length; i++){
        let split     = requests[i].split("."), //eg. ["_DB", "creature", "creator", "user", "local", "username"]
            path      = split.slice(2),         //eg. ["creator", "user", "local", "username"]
            keyword   = split[1],               //eg. "creature"
            {model, query} = get(keyword);
        
        console.log(split, path, keyword, model, query);
        
        console.log("paths", model.schema.paths);
        
        for(let j = 0; j < path.length; j++){ //eg "creatures"
          let fullPath = path.slice(0, j + 1).join('.');
          if(model.schema.paths[fullPath] && model.schema.paths[fullPath].options){ //prevent errors
            if(model.schema.paths[fullPath].options.ref){ //is reference, populate
              console.log("populate:", fullPath);
              console.log(query);
              query.populate(fullPath);
            }
            //possibly want an else-if here
            if(Array.isArray(model.schema.paths[fullPath].options.type) && model.schema.paths[fullPath].options.type[0]){ //check if array, and first child is ref. if so, populate. this can cause false positives but a solution is too complex.
              let set = model.schema.paths[fullPath].options.type[0];
              for(let prop in set){ //populate every child of the main object in the array, if they are refs
                if(set[prop].ref){
                  console.log("populate:", fullPath);
                  query.populate(fullPath);
                }
              }
            }
          }
        }
      }*/
    }
    return next();
    
    
    function get(keyword){
      //return new Promise(function(resolve, reject){
      console.log(keyword);
        switch (keyword) {
          case "user":
            if(req.user){
              return {
                model: models.user,
                query: models.user.findOne({'local.username': req.user.local.username})
              };
            } else {
              return {model: null, query: null};
            }
            //return models.user.findOne({'local.username': res.user.local.username});
            break;
          case "pageUser":
            let id = req.url.split("/").pop();
            return models.user.findOne({$or: [{'local.username': id}, {'_id': id}]});
            break;
          case "creature":
            return {
              model: models.creature,
              query: models.creature.findOne()
            };
            //return models.user.findOne({'local.username': res.user.local.username});
            break;
          default:
            return {model: null, query: null};
            break;
        }
      //});
    }
  }
}

function populate(query, paths){
  if(paths.length){
      let tree = {},
        cursor = tree;
    for(let i = 0; i < paths.length; i++){
      cursor = cursor.populate = {}
      cursor.path = paths[i];
    }
    query.populate(tree.populate)
  }
}

function isRef(model, path){
  if(model.schema.paths[path] && model.schema.paths[path].options){ //prevent errors
    if(model.schema.paths[path].options.ref){ //is reference, populate
      return model.schema.paths[path].options.ref;
    }
    if(Array.isArray(model.schema.paths[path].options.type) && model.schema.paths[path].options.type[0]){ //check if array, and first child is ref. if so, populate. this can cause false positives but a solution is too complex.
      let set = model.schema.paths[path].options.type[0];
      if(set.ref){
        return set.ref;
      }
      for(let prop in set){ //populate every child of the main object in the array, if they are refs
        if(set[prop].ref){
          return set[prop].ref;
        }
      }
    }
  }
  return false;
}