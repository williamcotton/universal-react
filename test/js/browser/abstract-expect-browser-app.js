var jsdom = require('jsdom')
var request = require('request')

module.exports = function (options, callback) {
  var defaultTitle = options.defaultTitle
  var t = options.t
  var browserApp = options.browserApp
  var testServerApp = options.testServerApp
  var universalAppSpec = options.universalAppSpec

  var baseRequest = request.defaults({
    baseUrl: testServerApp.baseUrl
  })

  if (!global.document) {
    global.document = jsdom.jsdom('<!doctype html><html><body><div id="universal-app-container"></div></body></html>')
    global.window = global.document.parentWindow
    global.navigator = {
      userAgent: 'node.js'
    }
  }

  global.window.incomingMessage = {}
  global.window.incomingMessage.defaultTitle = defaultTitle

  // prouter needs these globals
  global.addEventListener = global.window.addEventListener
  global.removeEventListener = global.window.removeEventListener
  global.location = global.window.location
  global.history = global.window.history

  require('node-jsx').install({extension: '.jsx'})

  var localStorage = require('localStorage')

  jsdom.jQueryify(global.window, 'http://code.jquery.com/jquery-2.1.1.js', function () {
    var browserAppInstance, server, rqResponse, followRedirect, serverInstanceApp

    var cookieJar = request.jar()

    baseRequest = request.defaults({
      baseUrl: testServerApp.baseUrl,
      jar: cookieJar
    })

    t.beforeEach(function (t) {
      rqResponse = {}
      followRedirect = true
      baseRequest = request.defaults({
        baseUrl: testServerApp.baseUrl,
        jar: cookieJar
      })
      var rootDOMId = 'universal-app-container'
      global.window.$('#' + rootDOMId).html('')
      browserAppInstance = browserApp({
        document: global.document,
        window: global.window,
        rootDOMId: rootDOMId,
        localStorage: localStorage,
        request: baseRequest
      })
      browserAppInstance.use(function (req, res, next) {
        if (!followRedirect) {
          res.headers = res.headers || {}
          rqResponse = res
          res.redirect = function (path) {
            res.headers.location = path
            if (res.onComplete) {
              res.onComplete()
            }
          }
        } else {
          res.redirect = function (path, callback) {
            if (res.onComplete) {
              res.onComplete()
            }
            browserAppInstance.navigate(path, callback)
          }
        }
        next()
      })
      server = browserAppInstance.listen()
      testServerApp.setup(function (_s) {
        serverInstanceApp = _s
        t.end()
      })
    })

    t.afterEach(function (t) {
      server.close()
      testServerApp.teardown(function () {
        t.end()
      })
    })

    var rq = function (options, callback) {
      var csrf = serverInstanceApp.getCsrf()
      if (options.form && csrf) {
        options.form._csrf = csrf
      }
      if (options.body && csrf) {
        options.body._csrf = csrf
      }
      if (typeof (options.followRedirect) !== 'undefined') {
        followRedirect = options.followRedirect
      }
      if (options.method && options.method.toLowerCase() === 'post') {
        browserAppInstance.submit(options.url, options.form, function () {
          callback(global.window.$, rqResponse)
        })
      } else {
        browserAppInstance.navigate(options.url)
        callback(global.window.$, rqResponse)
      }
    }

    var universalAppSpecsToPass = function (t) {
      universalAppSpec({
        t: t,
        rq: rq,
        defaultTitle: defaultTitle,
        baseRequest: baseRequest
      })
    }

    var expect = {
      universalAppSpecsToPass: universalAppSpecsToPass
    }

    callback(expect, t, rq, baseRequest)
  })
}
