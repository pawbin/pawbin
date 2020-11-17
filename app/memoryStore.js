class MemoryStore {
  constructor(schema, saveCallback = ()=>{}, {throttleDelay = 500, arrayDeepMonitor = true, nested = false, auxiliaryKeys = []} = {}) {
    let self = this;
    let storeKeys = [];
    let isArray = schema instanceof Array;
    let data = {};
    
    let throttle = (func, limit) => {
      let lastFunc;
      let lastRan;
      return function() {
        const context = this;
        const args = arguments;
        if(!lastRan){
          func.apply(context, args);
          lastRan = Date.now();
        } else {
          clearTimeout(lastFunc);
          lastFunc = setTimeout(function(){
            if((Date.now() - lastRan) >= limit){
              func.apply(context, args);
              lastRan = Date.now();
            }
          }, limit - (Date.now() - lastRan));
        }
      }
    }
    
    let nestedSaveCb;
    if(nested){
      self._save = saveCallback; //immediately call root's save()
      nestedSaveCb = saveCallback;
    } else {
      if(throttleDelay){
        self._save = throttle(()=>{
          saveCallback(self._compile());
        }, throttleDelay);
      } else {
        self._save = () => {
          saveCallback(self._compile());
        }
      }
      nestedSaveCb = self._save;
    }
    
    if(typeof schema === 'object'){
      if(isArray){
        if(arrayDeepMonitor){
          data = schema.map(v => {
            return createMonitor(v, nestedSaveCb, {throttleDelay, arrayDeepMonitor, nested: true});
          });
        }
      } else {
        for(let prop in schema){
          if(schema[prop] === undefined){
            continue;
          }
          //console.log('PROP', prop);
          if(!auxiliaryKeys.includes(prop)){
            storeKeys.push(prop);
            data[prop] = createMonitor(schema[prop], nestedSaveCb, {throttleDelay, arrayDeepMonitor, nested: true});
          }
        }
      }
    }
    
    function createMonitor(orig, ...args){
      if(typeof orig === 'object' && Object.keys(orig).length !== 0){ //is a non-empty object
        return new MemoryStore(orig, ...args);
      } else {
        return orig;
      }
    }
    
    self._compile = () => {
      let compiled = {};
      if(isArray){
        data.forEach((v, i) => {
          if(v instanceof MemoryStore){
            compiled[i] = v._compile();
          } else if(Array.isArray(v) && arrayDeepMonitor && v._compile){
            compiled[i] = v._compile();
          } else {
            compiled[i] = v;
          }
        });
      } else {
        storeKeys.forEach(k => {
          if(data[k] instanceof MemoryStore){
            compiled[k] = data[k]._compile();
          } else if(Array.isArray(data[k]) && arrayDeepMonitor && data[k]._compile){
            compiled[k] = data[k]._compile();
          } else {
            compiled[k] = data[k];
          }
        });
      }
      return compiled;
    }
    
    let proxy = new Proxy(data, {
      set(target, key, value, proxy) {
        if(typeof value !== 'object' && target[key] === value){ //identical update
          return true;
        }
        if((isArray && !isNaN(key)) || storeKeys.includes(key)){
          target[key] = createMonitor(value, nestedSaveCb, {throttleDelay, arrayDeepMonitor, nested: true});
          self._save();
        } else {
          target[key] = value;
        }
        return true;
      }
    });
    
    return proxy;
  }
}

module.exports = MemoryStore;