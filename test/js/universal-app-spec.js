module.exports = function (t, rq, defaultTitle) {
  var TestUtils = require('react-addons-test-utils')

  var async = require('async')

  // var expect = require('abstract-expect-universal-app')({
  //   t: t,
  //   rq: rq,
  //   universalApp: require('../../src/jsx/universal-app.jsx')
  // })

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

  require('../../src/jsx/universal-app.jsx')({
    app: mockApp
  })

  // expect.rootComponentToBeRendered(t)

  t.test('should create the Root Component', function (t) {
    t.plan(1)
    rq({url: '/'}, function ($) {
      var container = $('.root-component-container').html()
      t.ok(container, 'created Root Component')
    })
  })

  // missing: expect.contentToBeRenderedIntoRoot(t)

  // expect.defaultTitleToBeRendered(t)

  t.test('should have the defaultTitle', function (t) {
    t.plan(1)
    rq({url: '/'}, function ($) {
      var title = $('title').html()
      t.equal(title, defaultTitle, 'created proper title')
    })
  })

  // expect.allGetRoutesToBeRendered(t)

  t.test('should have GET routes mapped for all of the defined app.get() routes', function (t) {
    var routes = Object.keys(routesGETMap)
    var diff = arr_diff(routes, definedRoutes)
    var message = 'has same number of mapped routes as defined routes'
    if (diff.length > 0) {
      message += ' - missing: ' + diff
    }
    t.equal(routes.length, definedRoutes.length, message)
    t.end()
  })

  // expect.getRouteClasses(t)

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

  t.test('should POST /calculate and get the correct result', function (t) {
    rq({method: 'post', url: '/calculator', form: {firstNumber: 12, secondNumber: 34, operation: '+'}}, function ($) {
      t.equal($('.result').html(), '12 + 34 = 46', 'result was 12 + 34 = 46')
      t.end()
    })
  })
}
