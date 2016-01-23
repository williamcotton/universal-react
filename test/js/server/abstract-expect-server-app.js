var request = require('request')
var cheerio = require('cheerio')

module.exports = function (options, callback) {
  var t = options.t
  var defaultTitle = options.defaultTitle
  var testServerApp = options.testServerApp
  var universalAppSpec = options.universalAppSpec

  var baseRequest = request.defaults({
    baseUrl: testServerApp.baseUrl
  })

  var cookieJar, csrf

  t.beforeEach(function (t) {
    csrf = null
    cookieJar = request.jar()
    testServerApp.setup(function () {
      t.end()
    })
  })

  t.afterEach(function (t) {
    testServerApp.teardown(function () {
      t.end()
    })
  })

  var rq = function (options, callback) {
    options.jar = cookieJar // remember cookies between test instances
    if (options.form && csrf) {
      options.form._csrf = csrf
    }
    baseRequest(options, function (err, res, body) {
      if (err) {} // TODO
      var $ = cheerio.load(body, {xmlMode: true})
      csrf = $('input[name="_csrf"]').val()
      callback($, res)
    })
  }

  var exportBaseRequest = function (options, callback) {
    options.jar = cookieJar
    if (options.form && csrf) {
      options.form._csrf = csrf
    }
    baseRequest(options, function (err, res, body) {
      var $ = cheerio.load(body, {xmlMode: true})
      csrf = $('input[name="_csrf"]').val()
      callback(err, res, body)
    })
  }

  var universalAppSpecsToPass = function (t) {
    universalAppSpec({
      t: t,
      rq: rq,
      defaultTitle: defaultTitle,
      baseRequest: exportBaseRequest
    })
  }

  var expect = {
    universalAppSpecsToPass: universalAppSpecsToPass
  }

  callback(expect, t, rq, exportBaseRequest)
}
