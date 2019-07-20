function request(url, method, body){
  return fetch(url, {
    method,
    headers : {
      'accept'      : 'application/json', //to notify we want json data back as a response
      'content-type': 'application/json', //to specify the format of the extra data the client is sending, if anything
    },
    mode: 'no-cors',
    body: JSON.stringify(body) //data to send to server
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

api.catchCreature = (creatureId) => {
  return post(`/catch/${creatureId}`, {});
}

api.releaseCreature = (creatureInstanceId) => {
  return post(`/release/${creatureInstanceId}`, {});
}

api.postTest = (data, body) => {
  return post(`/test/${data}`, body);
}

api.getTest = (data) => {
  return get(`/test/${data}`);
}

function test(){
  /*api.catchCreature(1234).then(creature => {
    console.log('caught:', creature);
  }).catch(console.error);*/
  
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
}