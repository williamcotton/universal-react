var jsdom = require('jsdom')

module.exports = function (options, callback) {
  var defaultTitle = options.defaultTitle
  var t = options.t
  var browserApp = options.browserApp
  var universalAppSpec = options.universalAppSpec

  if (!global.document) {
    global.document = jsdom.jsdom('<!doctype html><html><body><div id="universal-app-container"></div></body></html>')
    global.window = global.document.parentWindow
    global.navigator = {
      userAgent: 'node.js'
    }
  }

  // prouter needs these globals
  global.addEventListener = global.window.addEventListener
  global.removeEventListener = global.window.removeEventListener
  global.location = global.window.location
  global.history = global.window.history

  require('node-jsx').install({extension: '.jsx'})

  var localStorage = require('localStorage')

  jsdom.jQueryify(global.window, 'http://code.jquery.com/jquery-2.1.1.js', function () {
    var browserAppInstance, server

    t.beforeEach(function (t) {
      browserAppInstance = browserApp({
        document: global.document,
        window: global.window,
        browserEnv: {
          nodeEnv: 'test'
        },
        rootDOMId: 'universal-app-container',
        defaultTitle: defaultTitle,
        localStorage: localStorage
      })
      server = browserAppInstance.listen()
      t.end()
    })

    t.afterEach(function (t) {
      server.close()
      t.end()
    })

    var rq = function (options, callback) {
      if (options.method && options.method.toLowerCase() === 'post') {
        browserAppInstance.submit(options.url, options.form)
      } else {
        browserAppInstance.navigate(options.url)
      }
      callback(global.window.$)
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
  })
}
