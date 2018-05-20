const CronJob = require('cron').CronJob;
const User    = require('../app/models/user');


//TODO: update url/token properties to include createdAt date
var dbMainJob = new CronJob('0 0 * * *', function() {
    User.update(
      {'resetPassword.createdAt': { $lt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }}, //query
      {resetPassword: {}}, //update
      {multi: true}, //options
      function(err) {
        console.error(err);
      }
    );
    User.update(
      {'updateEmail.createdAt': { $lt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }}, //query
      {updateEmail: {}}, //update
      {multi: true}, //options
      function(err) {
        console.error(err);
      }
    );
  },
  null,
  true
);