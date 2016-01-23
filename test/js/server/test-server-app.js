var overwrite = function (a, b) {
  var o = {}
  var prop
  for (prop in a) {
    o[prop] = a[prop]
  }
  for (prop in b) {
    o[prop] = b[prop]
  }
  return o
}

module.exports = function (options, callback) {
  var serverApp = options.serverApp
  var defaultTitle = options.defaultTitle

  var nodeEnv = 'test'
  var port = 12345
  var baseUrl = 'http://localhost:' + port

  var serverAppConfig = options.serverAppConfig || {}

  serverAppConfig.defaultTitle = defaultTitle
  serverAppConfig.nodeEnv = nodeEnv
  serverAppConfig.port = port

  var userAuthenticationDataStore = require('../../../src/js/lib/expect-mem-user-authentication-data-store')()

  serverAppConfig.userAuthenticationDataStore = userAuthenticationDataStore

  var knex = require('knex')({
    client: 'pg',
    debug: false
  })

  var bookshelf = require('bookshelf')(knex)

  serverAppConfig.bookshelf = bookshelf

  serverAppConfig.emailService = options.emailService || {
    sendVerificationUrl: function (options, callback) {
      callback(false, true)
    },
    sendResetPasswordUrl: function (options, callback) {
      callback(false, true)
    }
  }

  var server, serverAppInstance

  var setup = function (callback, otherConfig) {
    var config = overwrite(serverAppConfig, otherConfig)
    serverAppInstance = serverApp(config)
    server = serverAppInstance.listen(port, function () {
      callback(serverAppInstance)
    })
  }

  var teardown = function (callback) {
    server.close()
    callback()
  }

  return {
    setup: setup,
    teardown: teardown,
    port: port,
    baseUrl: baseUrl
  }
}
