function request(url, method, body){
  let headerBody;
  if(body){
    if(method.toUpperCase() === 'GET'){
      headerBody = JSON.stringify(body);
      body = undefined;
    } else {
      body = JSON.stringify(body);
    }
  }
  return fetch(url, {
    method,
    headers : {
      'Accept'      : 'application/json, text/plain, */*', //to notify we want json data back as a response
      'Content-Type': 'application/json', //to specify the format of the extra data the client is sending, if anything
      ...(headerBody ? { body: headerBody } : {}), //TODO: possibly change to support older browsers
    },
    //mode: 'no-cors',
    ...(body ? { body } : {}), //data to send to server
  }).then(res=>{
    if(res.ok){
      return res.json();
    } else {
      return res.json().then(v=>Promise.reject(v)).catch(v=>Promise.reject(v));
    }
  });
}

function post(url, body){
  return request(url, 'POST', body);
}

function get(url, body){
  return request(url, 'GET', body);
}

let api = {};

api.post = post;
api.get = get;

api.spawnCreature = (creatureId) => {
  return post(`/api/spawn/${creatureId}`, {});
}

api.catchCreature = (biome) => {
  return post(`/api/catch/${biome}`, {});
}

api.catchSilhouette = (biome, id) => {
  return post(`/api/catchSilhouette/${biome}/${id}`, {});
}

api.releaseCreature = (creatureId) => {
  return post(`/api/release/${creatureId}`, {});
}

api.postTest = (data, body) => {
  return post(`/api/test/${data}`, body);
}

api.getTest = (data) => {
  return get(`/api/test/${data}`);
}

api.renewBatch = (biome) => {
  return post(`/api/renewbatch/${biome}`);
}

api.getGlobalSettings = () => {
  return get(`/api/globalsettings`);
}

api.setGlobalSettings = (path, value) => {
  return post(`/api/globalsettings`, {path, value});
}

api.getUserCreatures = (user, populatePath) => {
  if(user){
    return get(`/api/creatures/${user}`, {populatePath});
  } else{
    return get(`/api/creatures`, {populatePath});
  }
}

api.getUser = (user, populatePath) => {
  if(user){
    return get(`/api/user/${user}`, {populatePath});
  } else{
    return get(`/api/user`, {populatePath});
  }
}

api.getSilhouettes = (biome, populatePath) => {
  return get(`/api/silhouettes/${biome}`, {populatePath});
}


function test(){
  /*api.spawnCreature(1234).then(creature => {
    console.log('caught:', creature);
  }).catch(console.error);*/
  
  /*
  api.postTest('hi', {message: 'hello world'}).then(message => {
    console.log('posttest success:', {message});
  }).catch(err => {
    console.log('posttest fail:', err);
  });
  
  api.getTest('hey').then(message => {
    console.log('gettest success:', {message});
  }).catch(err => {
    console.log('gettest fail:', err);
  });
  */
  
  api.getGlobalSettings().then(settings => {
    console.log({settings});
  }).catch(console.error);
}