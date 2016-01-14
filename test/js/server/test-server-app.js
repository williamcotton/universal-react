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

  var server, serverAppInstance

  var setup = function (callback) {
    serverAppInstance = serverApp(serverAppConfig)
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
