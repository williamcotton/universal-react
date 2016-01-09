var test = require('tapes')
var request = require('request')
var cheerio = require('cheerio')

require('node-jsx').install({extension: '.jsx'})

var nodeEnv = 'test'
var defaultTitle = 'Test'
var port = 12345
var baseUrl = 'http://localhost:' + port

var universalAppSpec = require('../universal-app-spec')

test('serverApp', function (t) {
  var serverApp, server

  t.beforeEach(function (t) {
    serverApp = require('../../../src/js/server/app')({
      defaultTitle: defaultTitle,
      nodeEnv: nodeEnv,
      port: port
    })
    server = serverApp.listen(port, function () {
      t.end()
    })
  })

  t.afterEach(function (t) {
    server.close()
    t.end()
  })

  var domRoute = function (route, callback) {
    request(baseUrl + route, function (err, res, body) {
      if (err) {} // TODO
      var $ = cheerio.load(body, {xmlMode: true})
      callback($)
    })
  }

  universalAppSpec(t, domRoute, defaultTitle)

  t.end()
})
