let config = {
  anonSessionAge: 60 * 60 * 1000, // 1 hour
  userSessionAge: 14 * 24 * 60 * 60 * 1000, // 14 days
  DBurl: process.env.DB_URL
}

module.exports = config;