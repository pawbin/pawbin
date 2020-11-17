const fs = require('fs');


let settings = {};

let keys = [];

settings.update = () => {
  let data = get();
  let obj = {};
  for(let name in data){
    settings[name] = data[name];
    obj[name] = data[name];
  }
  return obj;
}

settings.list = () => {
  let obj = {};
  keys.forEach(key => {
    obj[key] = settings[key];
  });
  return obj;
}

settings.store = () => {
  set(settings.list());
}

settings.set = (path, value) => {
  if(!path || !value){
    return false;
  }
  let data = get(); //NOTE: could be settings.list() instead, mostly doesn't matter.
  let obj = data;
  //TODO: move this to its own utility function?
  path = path.split(/[\[\].]/g).filter(v => v !== '');
  if(path.length <= 1){
    obj[path] = value;
  } else {
    for(let i = 0; i < path.length-1; i++){
      obj = obj[path[i]];
      if(obj === undefined){
        return false;
      }
    }
    obj[path[path.length-1]] = value;
    console.log({data});
  }
  
  set(data);
  for(let name in data){
    settings[name] = data[name];
  }
}

function get(){
  let obj = fs.readFileSync('config/globalSettings.json');
  keys = Object.keys(obj);
  return JSON.parse(obj);
}

function set(data){
  data = JSON.stringify(data);
  fs.writeFileSync('config/globalSettings.json', data)
}

settings.update();

module.exports = settings;