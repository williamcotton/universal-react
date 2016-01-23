module.exports = function (options) {
  var defaultTitle = options.defaultTitle
  var rq = options.rq
  var t = options.t
  var baseRequest = options.baseRequest

  var expectUniversalApp = require('./abstract-expect-universal-app')({
    t: t, rq: rq,
    defaultTitle: defaultTitle,
    universalApp: require('../../src/jsx/universal-app.jsx')
  })

  expectUniversalApp.rootComponentToBeRendered(t)
  expectUniversalApp.defaultTitleToBeRendered(t)
  expectUniversalApp.allGetRoutesToBeRendered(t, {ignore: ['/login', '/reset-password', '/new-password', '/logout', '/songs', '/songs/:id', '/songs/:id/edit']})
  expectUniversalApp.getRouteClasses(t)

  t.test('should POST /calculate and get the correct result', function (t) {
    baseRequest({url: '/calculator'}, function () {
      rq({method: 'post', url: '/calculator', form: {firstNumber: 12, secondNumber: 34, operation: '+'}}, function ($) {
        t.equal($('.result').html(), '12 + 34 = 46', 'result was 12 + 34 = 46')
        t.end()
      })
    })
  })

  t.test('should POST /calculate and get back nothing when using incorrect operation type', function (t) {
    baseRequest({url: '/calculator'}, function () {
      rq({method: 'post', url: '/calculator', form: {firstNumber: 12, secondNumber: 34, operation: 3}}, function ($) {
        t.equal($('.result').html(), '', 'result was blank')
        t.end()
      })
    })
  })

  var uuid = 'universal-user-0@test.com'
  var password = 'test1234'

  t.test('should /signup', function (t) {
    baseRequest({url: '/signup'}, function (err, res, body) {
      rq({followRedirect: false, method: 'post', url: '/signup', form: {type: 'email', uuid: uuid, password: password, repeatPassword: password}}, function ($, res) {
        t.equal(res.headers.location, '/welcome', 'should redirect to /welcome')
        t.end()
      })
    })
  })

  t.test('should /login', function (t) {
    baseRequest({url: '/login'}, function (err, res, body) {
      rq({followRedirect: false, method: 'post', url: '/login', form: {type: 'email', uuid: uuid, password: password}}, function ($, res) {
        t.equal(res.headers.location, '/welcome', 'should redirect to /welcome')
        t.end()
      })
    })
  })

  t.test('should NOT /signup again with existing uuid', function (t) {
    baseRequest({url: '/signup'}, function (err, res, body) {
      rq({followRedirect: false, method: 'post', url: '/signup', form: {type: 'email', uuid: uuid, password: password, repeatPassword: password}}, function ($, res) {
        t.equal(res.headers.location, undefined, 'no redirect')
        t.end()
      })
    })
  })

  t.test('should /logout', function (t) {
    rq({followRedirect: false, url: '/logout'}, function ($, res) {
      t.equal(global.window.location.pathname, '/logout', 'loaded logout path')
      t.end()
    })
  })
}
