/**
  routes.js
 * initialize server, set up middleware
 */

const config       = require('../../config.js');
const serverHelper = require('../site/serverHelper.js');
const userHelper   = require('../site/userHelper.js');
const postHelper   = require('../site/postHelper.js');
const rights       = require('../site/rights.js');
const request = require('request');
const multer  = require('multer');
const api     = require('../api.js')();

const User         = require('../models/user.js');

const gameSetup = require("../game/setup.js");
let gameHelper;
gameSetup.then(game => {
  gameHelper = require("../game/gameHelper.js")(game);
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'static/uploads');
  },
  filename: function (req, file, cb) {
    //INFO: use mimetype??
    console.log('DSFHLDSHFSDLJHFLDS', req.uploadFilename);
    let ext = file.originalname.split('.').pop(),
        filename = req.uploadFilename ? req.uploadFilename : Date.now();
    cb(null, filename + '.' + ext);
  }
});
const upload  = multer({ storage });

const fs = require('fs');

const url = require('url');

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
  
  ['premium', (req, res, o) => {
    req.loginCheck(() => res.toRender('premium'));
  }],
  
  ['profile', (req, res, o) => {
    req.loginCheck(() => {
      userHelper.getUser(req.user, ['creaturesRef.creatureTypeRef']).then(pageUser => {
        res.toRender('profile', {pageUser});
      }).catch(err => {render404(req, res, err)});
    });
  }],
  
  [/^(profile\/.+)$/, (req, res, o) => {
    if(o.filename == 'torcado'){
      User.findOne({'local.username': o.filename}).populate({
        path:'creatures',
        populate: {
          path: 'creatureTypeRef'
        }
      }).exec((err, doc) => {
        //console.log('dgfdgdf', err, doc.creatures);
        //doc = doc.toJSON();
        res.toRender('profile', {pageUser: doc});
      });
    } else {
      userHelper.getUserPublic(o.filename, ['creaturesRef.creatureTypeRef']).then(pageUser => {
        res.toRender('profile', {pageUser});
      }).catch(err => {render404(req, res, err)});
    }
  }],
  
  ['profiles', (req, res, o) => {
    userHelper.getUsers().then(users => {
      res.toRender('profiles', {users});
    }).catch(err => {render404(req, res, err)});
  }],
  
  ['creatures', (req, res, o) => {
    req.loginCheck(() => {
      userHelper.getUser(req.user, ['creaturesRef.creatureTypeRef']).then(pageUser => {
        res.toRender('creatures', {pageUser});
      }).catch(err => {render404(req, res, err)});
    });
  }],
  
  [/^(creatures\/.+)$/, (req, res, o) => {
    if(o.filename == 'torcado'){
      User.findOne({'local.username': o.filename}).populate({
        path:'creatures',
        populate: {
          path: 'creatureTypeRef'
        }
      }).lean().exec((err, doc) => {
        //console.log('dgfdgdf', err, doc.creatures);
        res.toRender('creatures', {pageUser: doc});
      });
      // User.aggregate([{
      //   $match: {'local.username': o.filename}
      // },
      // {
      //   $lookup: {
      //     from: 'creatures',
      //     let: {'owner': '$_id'},
      //     as: 'creatures',
      //     pipeline: [
      //       {$match: { $expr: { $eq: ["$owner", "$ownerRef"] }}},
      //       {
      //         $lookup: {
      //           // from: 'creaturetypes',
      //           // let: {'creatureType': 'creatureTypeRef'},
      //           // as: 'creatureType',
      //           // pipeline: [
      //           //   { $match: { $expr: { $eq: ["creatureTypeRef", "_id"] }}}
      //           // ],
      //           from: 'creaturetypes',
      //           localField: 'creatureTypeRef',
      //           foreignField: '_id',
      //           as: 'creatureType'
      //         }            
      //       },
      //       {$unwind: {
      //         path: '$creatureType'
      //       }}
      //     ]
      //   }
      // }]).exec((err, doc) => {
      //   //console.log('dgfdgdf', err);
      //   //console.log(doc, doc[0].creatures[0]);
      //   //console.log(doc[0].creatures.map(v => v.creatureType).filter(v => v));
      //   res.toRender('creatures', {pageUser: doc[0]});
      // });
    } else {
      userHelper.getUser(o.filename, ['creaturesRef.creatureTypeRef']).then(pageUser => {
        //console.log(pageUser);
        res.toRender('creatures', {pageUser});
      }).catch(err => {render404(req, res, err)});
    }
  }],
  
  ['settings', (req, res, o) => {
    req.loginCheck(() => res.toRender('settings'));
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
    }).catch(err => {render404(req, res, err)});
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
    }).catch(err => {render404(req, res, err)});
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
  
  ['sitemap', (req, res, o) => {
    let files = [];
    let pointer = [files];
    let curPath = ['views', 'pages'];
    function parseDir(dir){
      let ls = fs.readdirSync(dir);
      ls.forEach(name => {
        curPath.push(name);
        if(fs.lstatSync(curPath.join('/')).isDirectory()){
          let a = []
          pointer[0].push({[name]: (pointer.unshift(a), a)});
          parseDir(curPath.join('/'));
          pointer.shift();
        } else {
          pointer[0].push(name);
        }
        curPath.pop();
      });
    }
    parseDir(curPath.join('/'));
    console.log(files);
    let pages = Array.from(lookup.keys());
    pages = pages.filter(v => typeof v === 'string');
    pages = pages.map(v => v.length ? v + '.html' : v);
    
    pages.push(...files);
    pages = [...new Set(pages)];
    pages = pages.sort((a, b) => a < b ? -1 : 1);
    console.log(pages);
    res.toRender('sitemap', {pages});
  }],
  
  ['silhouettetest', (req, res, o) => {
    req.loginCheck(() => {
      gameSetup.then((game) => {
        gameHelper.getSilhouettes('grassland', ['creatureRef.creatureTypeRef']).then(silhouettes => {
          res.toRender('silhouettetest', {silhouettes});
        }).catch(err => {render404(req, res, err)});
      });
    });
  }],
  
  ['favicon.ico', (req, res, o) => {
    request('https://cdn.glitch.com/3ffbe794-725c-40ae-b812-76257af22230%2Ficon_pajamy.png?v=1556597301416').pipe(res);
  }],
]);
/* === END LOOKUP TABLE == */

function render404(req, res, error){
  console.error(error);
  res.render(root('404'), {
    source: req.path.replace(/\/$/, "").slice(1) || 'this page',
    error,
    //loggedIn: !!req.user,
    //user: req.user,
  })
}

/*function render404error(error){
  res.render(root('404'), {error});
}*/

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
      //console.log(req.sessionInfo)
      res.render(root(path), {...options, ...req.sessionInfo, session: req.session, notifs: req.flash('notif')}, cb);
    };
    next();
  });
  
  
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));
  
  app.post('/login', function(req, res, next){
    passport.authenticate('local-login', function(err, user, info){
      if(err){ 
        return next(err); 
      }
      if(!user){
        return res.redirect("/login");
      } 
      req.logIn(user, function(err) {
        if(err){ return next(err); }
        let path = url.parse(req.headers.referer).pathname;
        if(path === '/login' || path === '/login.html'){
          return res.redirect('/profile');
        } else {
          req.flash('notif', {content: 'login successful!', type: 'success'})
          return res.redirect(req.headers.referer);
        }
      });
    })(req, res, next)
  });
  
  app.post('/requestreset', postHelper.requestReset);
  
  app.post('/resetpassword', postHelper.resetPassword);
  
  app.post('/updateemail', postHelper.updateEmail);
  
  app.post('/updatepassword', postHelper.updatePassword);
  
  app.post('/updateavatar', (req, res, next) => {req.uploadFilename = req.user._id, next()}, upload.single('avatar'), postHelper.updateAvatar);
  
  app.post('/updatenickname', postHelper.updateNickname);
  
  
  // GET catch-all, handle every request
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