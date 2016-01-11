var request = require('request')
var cheerio = require('cheerio')

module.exports = function (options, callback) {
  var t = options.t
  var defaultTitle = options.defaultTitle
  var serverApp = options.serverApp
  var universalAppSpec = options.universalAppSpec

  var nodeEnv = 'test'
  var port = 12345
  var baseUrl = 'http://localhost:' + port

  var server, serverAppInstance

  t.beforeEach(function (t) {
    serverAppInstance = serverApp({
      defaultTitle: defaultTitle,
      nodeEnv: nodeEnv,
      port: port
    })
    server = serverAppInstance.listen(port, function () {
      t.end()
    })
  })

  t.afterEach(function (t) {
    server.close()
    t.end()
  })

  var rq = function (options, callback) {
    options.url = baseUrl + options.url
    request(options, function (err, res, body) {
      if (err) {} // TODO
      var $ = cheerio.load(body, {xmlMode: true})
      callback($)
    })
  }

  var universalAppSpecsToPass = function (t) {
    universalAppSpec({
      t: t,
      rq: rq,
      defaultTitle: defaultTitle
    })
  }

  var expect = {
    universalAppSpecsToPass: universalAppSpecsToPass
  }

  callback(expect)
}
