module.exports = () => {
  return function(req, res, next) {
    if(req.headers.body){
      let headerBody = JSON.parse(req.headers.body);
      req.body = {...req.body, ...headerBody};
    }
    return next();
  }
}