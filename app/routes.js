/**
  routes.js
 * initialize server, set up middleware
 */

const config       = require('../config.js');
const serverHelper = require('../app/serverHelper');
const postHelper   = require('../app/postHelper');
const rights       = require('../app/rights');
const merge        = require('../app/merge');

let _DEFAULT = Symbol('_DEFAULT');

/* === URL LOOKUP TABLE == */
let lookup = new Map([
  
  [_DEFAULT, (req, res, o) => {
    console.log("user accessed: ", req.params[0]);
    res.toRender(stripUrl(o.origin), function(err, html){
      if(err){
        console.log(err);
        render404(req, res);
      } else {
        res.send(html);
      }
    });
  }],
  
  ['', (req, res, o) => {
    res.toRender('index');
  }],
  
  ['profile', (req, res, o) => {
    req.loginCheck(() => res.toRender('profile'));
  }],
  
  ['controlpanel', (req, res, o) => {
    req.rightCheck('admin', () => res.toRender('profile'));
  }],
  
  [/^(verify\/.+)$/, (req, res, o) => {
    serverHelper.verifyEmail(o.filename).then(function(user){
      if(!req.session.passport){
        req.session.passport = {};
      }
      req.session.passport.user = user._id;
      res.redirect('/profile');
    }).catch(console.error);
  }],
  
  ['requestreset', (req, res, o) => {
    res.toRender('requestreset');
  }],
  
  [/^(resetpassword\/.+)$/, (req, res, o) => {
    res.toRender('resetpassword');
  }],
  
  [/^(updateemail\/.+)$/, (req, res, o)  => {
    serverHelper.updateEmail(o.filename).then(function(user){
      req.flash('notif', {content: 'email successfully updated.', type: "success"});
      res.redirect('/profile');
    }).catch(console.error);
  }],
  
  ['logout', (req, res, o) => {
    //TODO: send success flash notif?
    if(req.user){
      req.session.cookie = {};
    }
    req.session.destroy(function() {
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  }],
  
]);
/* === END LOOKUP TABLE == */

function render404(req, res){
  res.render(root('404'), {
    //...session,
    source: req.path.replace(/\/$/, "").slice(1) || 'this page',
    loggedIn: !!req.user,
    user: req.user,
    //info:  JSON.parse(circularJSON.stringify({req: req, res: res}))
  })
}

function root(path){
  return 'views/pages/' + path;
}

function stripUrl(url){
  return url.toLowerCase().replace(/\.html$/, '');
}

function loginCheck(req, res, cb){
  if(req.user){
    cb();
  } else {
    
  }
}

function routes(app, passport){
  // define toRender
  app.use((req, res, next) => {
    
    req.sessionInfo = {
      loggedIn: !!req.user,
      user: req.user
    }
    
    //touch session
    if(req.user){
      req.session._garbage = Date();
      req.session.touch();
      req.session.cookie.maxAge = 10 * config.userSessionAge;
      req.session.cookie.expires = new Date(Date.now() + config.userSessionAge);
    }
    
    req.loginCheck = (pass, fail) => {
      if(req.user){
        pass();
      } else {
        if(fail){
          fail();
        } else {
          req.flash('notif', {content: 'You must be logged in to access that page', type: "error"});
          res.redirect('/login');
        }
      }
    };
    
    req.rightCheck = (right, pass, fail) => {
      req.loginCheck(() => {
        if(rights.check(req.user, right)){
          pass();
        } else {
          if(fail){
            fail();
          } else {
            req.flash('notif', {content: 'You do not have sufficient rights to access that page', type: "error"});
            res.redirect('/login');
          }
        }
      }, fail);
    };
    
    res.toRender = (path, options, cb) => {
      if(typeof options === 'function'){
        cb = options;
        options = {};
      }
      console.log(req.sessionInfo)
      res.render(root(path), {...options, ...req.sessionInfo, notifs: req.flash('notif')}, cb);
    };
    next();
  });
  
  
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/signup', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));
  
  app.post('/login', function(req, res, next){
    passport.authenticate('local-login', {
      successRedirect : '/profile', // redirect to the secure profile section
      failureRedirect : '/login', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
    })(req, res, next)
  });
  
  app.post('/requestreset', postHelper.requestReset);
  
  app.post('/resetpassword', postHelper.resetPassword);
  
  app.post('/updateemail', postHelper.updateEmail);
  
  app.post('/updatepassword', postHelper.updatePassword);
  
  
  // GET catch-all, hanlde every request
  app.get(/(.*)/, (req, res) => {
    let dir = req.path.replace(/\/$/, "").slice(1),
        filename = dir.split('/').pop();
    
    // get resource from lookup table
    if(lookup.has(stripUrl(dir))){
      lookup.get(stripUrl(dir))(req, res, {type: 'direct', origin: dir, filename});
    } else {
      for(let [key, value] of lookup){
        if(typeof key === 'string' || typeof key === 'symbol'){
          continue;
        }
        if(key.test(dir)){
          return value(req, res, {type: 'match', origin: dir, filename});
        }
      }
      lookup.get(_DEFAULT)(req, res, {type: 'default', origin: dir, filename});
    }
  });
  
}
module.exports = routes;