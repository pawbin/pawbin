const fs = require('fs');


let settings = {};

settings.update = () => {
  let data = get();
  for(let name in data){
    settings[name] = data[name];
  }
}

settings.store = () => {
  let obj = {};
  let data = get();
  for(let name in data){
    obj[name] = settings[name];
  }
  set(obj);
}

settings.set = (path, value) => {
  let data = get();
  let obj = data;
  //TODO: move this to its own utility function?
  path = path.split(/[\[\].]/g).filter(v => v !== '');
  if(path.length <= 1){
    obj[path] = value;
  } else {
    for(let i = 0; i < path.length-1; i++){
      obj = obj[path[i]];
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
  return JSON.parse(obj);
}

function set(data){
  data = JSON.stringify(data);
  fs.writeFileSync('config/globalSettings.json', data)
}

settings.update();

module.exports = settings;