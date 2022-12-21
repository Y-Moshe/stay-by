var config

if (process.env.NODE_ENV === 'production') {
  config = require('./prod')
} else {
  // config = require('./dev')
  config = require('./prod')
}
config.CRYPTR_SECRET = process.env.CRYPTR_SECRET
config.isGuestMode = false

module.exports = config