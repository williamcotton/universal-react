var test = require('tapes')
var jsdom = require('jsdom')
var request = require('request')

var universalAppSpec = require('../universal-app-spec')

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

var defaultTitle = 'Test'

test('browserApp', function (t) {
  jsdom.jQueryify(global.window, 'http://code.jquery.com/jquery-2.1.1.js', function () {
    var browserApp, server

    t.beforeEach(function (t) {
      browserApp = require('../../../src/js/browser/app.js')({
        document: global.document,
        window: global.window,
        browserEnv: {
          nodeEnv: 'test'
        },
        rootDOMId: 'universal-app-container',
        defaultTitle: defaultTitle,
        localStorage: localStorage,
        request: request
      })
      server = browserApp.listen()
      t.end()
    })

    t.afterEach(function (t) {
      server.close()
      t.end()
    })

    var domRoute = function (route, callback) {
      browserApp.navigate(route)
      callback(global.window.$)
    }

    universalAppSpec(t, domRoute, defaultTitle)

    t.end()
  })
})
