module.exports = function (t, domRoute, defaultTitle) {
  var TestUtils = require('react-addons-test-utils')

  var async = require('async')

  var Router = require('router')
  var router = new Router()

  var arr_diff = function (a1, a2) {
    var a = []
    var diff = []
    for (var i = 0; i < a1.length; i++) {
      a[a1[i]] = true
    }
    for (var j = 0; i < a2.length; i++) {
      if (a[a2[j]]) delete a[a2[j]]
      else a[a2[j]] = true
    }
    for (var k in a)
      diff.push(k)
    return diff
  }

  var definedRoutes = []
  var routesMap = {}

  var mockApp = {
    get: function (route, handler) {
      definedRoutes.push(route)
      router.get(route, function (req, res) {
        handler(req, res)
      })
      var req = {
        url: route,
        method: 'GET'
      }
      var res = {
        renderApp: function (content, opts) {
          var shallowRenderer = TestUtils.createRenderer()
          shallowRenderer.render(content)
          var renderedOutput = shallowRenderer.getRenderOutput()
          routesMap[route] = renderedOutput.props.className
        // routesMap['/login'] = 'login-container'
        }
      }
      router.handle(req, res, function () {})
    },
    post: function (route, handler) {}
  }

  require('../../src/jsx/universal-app.jsx')({
    app: mockApp
  })

  t.test('should create the App component', function (t) {
    t.plan(1)
    domRoute('/', function ($) {
      var container = $('.app-container').html()
      t.ok(container, 'created App component')
    })
  })

  t.test('should have the defaultTitle', function (t) {
    t.plan(1)
    domRoute('/', function ($) {
      var title = $('title').html()
      t.equal(title, defaultTitle, 'created proper title')
    })
  })

  t.test('should have routes mapped for all of the defined routes', function (t) {
    var routes = Object.keys(routesMap)
    var diff = arr_diff(routes, definedRoutes)
    var message = 'has same number of mapped routes as defined routes'
    if (diff) {
      message += ' - missing: ' + diff
    }
    t.equal(routes.length, definedRoutes.length, message)
    t.end()
  })

  t.test('should load all the routes specified in the routes map and find the expected DOM elements', function (t) {
    var routes = Object.keys(routesMap)
    t.plan(routes.length)
    async.each(routes, function (route, callback) {
      var className = routesMap[route]
      domRoute(route, function ($) {
        var container = $('.' + className).html()
        t.ok(container, route + ' has ' + className)
        callback()
      })
    })
  })
}
