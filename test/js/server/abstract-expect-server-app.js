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

  var server, serverAppInstance, cookieJar, csrf

  var serverAppConfig = options.serverAppConfig || {}

  serverAppConfig.defaultTitle = defaultTitle
  serverAppConfig.nodeEnv = nodeEnv
  serverAppConfig.port = port

  t.beforeEach(function (t) {
    csrf = null
    cookieJar = request.jar()
    serverAppInstance = serverApp(serverAppConfig)
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
    options.jar = cookieJar // remember cookies between test instances
    if (options.form && csrf) {
      options.form._csrf = csrf
    }
    request(options, function (err, res, body) {
      // console.log('request', options, err, body)
      if (err) {} // TODO
      var $ = cheerio.load(body, {xmlMode: true})
      csrf = $('input[name="_csrf"]').val()
      // if there's a hidden HTML input element with a name "_csrf", set the variable, and then it'll attach to the form post on the next rq
      callback($, res)
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

  callback(expect, t, rq)
}
