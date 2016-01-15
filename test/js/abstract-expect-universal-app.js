module.exports = function (options) {
  var TestUtils = require('react-addons-test-utils')
  var async = require('async')

  var defaultTitle = options.defaultTitle
  var rq = options.rq
  var universalApp = options.universalApp

  var Router = require('router')
  var router = new Router()

  var arr_diff = function (a1, a2) {
    var a = []
    var diff = []
    for (var i = 0; i < a1.length; i++) {
      a[a1[i]] = true
    }
    for (var j = 0; j < a2.length; j++) {
      if (a[a2[j]]) delete a[a2[j]]
      else a[a2[j]] = true
    }
    for (var k in a)
      diff.push(k)
    return diff
  }

  var definedRoutes = []
  var routesGETMap = {}

  var mockApp = {
    get: function (route, handler) {
      if (arguments.length > 2) { // skip any routes with middleware
        return
      }
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
          routesGETMap[route] = renderedOutput.props.className
        // routesGETMap['/login'] = 'login-container'
        }
      }
      router.handle(req, res, function () {})
    },
    post: function (route, handler) {}
  }

  universalApp({
    app: mockApp
  })

  var rootComponentToBeRendered = function (t) {
    t.test('should create the Root Component', function (t) {
      t.plan(1)
      rq({url: '/'}, function ($) {
        var container = $('.root-component-container').html()
        t.ok(container, 'created Root Component')
      })
    })
  }

  var defaultTitleToBeRendered = function (t) {
    t.test('should have the defaultTitle', function (t) {
      t.plan(1)
      rq({url: '/'}, function ($) {
        var title = $('title').html()
        t.equal(title, defaultTitle, 'created proper title')
      })
    })
  }

  var allGetRoutesToBeRendered = function (t, options) {
    var ignore = options.ignore
    t.test('should have GET routes mapped for all of the defined app.get() routes', function (t) {
      var routes = Object.keys(routesGETMap)
      var diff = arr_diff(routes, definedRoutes)
      ignore.forEach(function (routeToIgnore) {
        if (diff.indexOf(routeToIgnore) > -1) {
          diff.splice(diff.indexOf(routeToIgnore), 1)
        }
      })
      var message = 'has same number of mapped routes as defined routes'
      if (diff.length > 0) {
        message += ' - missing: ' + diff
      }
      t.equal(diff.length, 0, message)
      t.end()
    })
  }

  var getRouteClasses = function (t) {
    t.test('should load all the GET routes specified in the routes map and find the expected DOM elements', function (t) {
      var routes = Object.keys(routesGETMap)
      t.plan(routes.length)
      async.each(routes, function (route, callback) {
        var className = routesGETMap[route]
        rq({url: route}, function ($) {
          var container = $('.' + className).html()
          t.ok(container, route + ' has ' + className)
          callback()
        })
      })
    })
  }

  return {
    rootComponentToBeRendered: rootComponentToBeRendered,
    defaultTitleToBeRendered: defaultTitleToBeRendered,
    allGetRoutesToBeRendered: allGetRoutesToBeRendered,
    getRouteClasses: getRouteClasses
  }
}
