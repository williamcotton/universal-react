var test = require('tapes')

var universalAppSpec = require('../universal-app-spec')
var browserApp = require('../../../src/js/browser/app.js')
var serverApp = require('../../../src/js/server/app.js')
var defaultTitle = 'Test'

test('browserApp', function (t) {
  var testServerApp = require('../server/test-server-app')({
    serverApp: serverApp,
    defaultTitle: defaultTitle
  })

  require('./abstract-expect-browser-app')({
    browserApp: browserApp,
    testServerApp: testServerApp,
    universalAppSpec: universalAppSpec,
    defaultTitle: defaultTitle,
    t: t
  }, function (expect, t, rq, baseRequest, cookieJar) {
    t.test('should /signup', function (t) {
      baseRequest({url: '/signup'}, function (err, res, body) {
        rq({followRedirect: false, method: 'post', url: '/signup', form: {type: 'email', uuid: 'steve@test.com', password: 'test1234', repeat_password: 'test1234'}}, function ($, res) {
          t.ok($('.front-page-container').html(), 'has front-page-container')
          t.end()
        })
      })
    })

    t.test('should /login', function (t) {
      baseRequest({url: '/login'}, function (err, res, body) {
        rq({followRedirect: false, method: 'post', url: '/login', form: {type: 'email', uuid: 'steve@test.com', password: 'test1234'}}, function ($, res) {
          t.ok($('.front-page-container').html(), 'has front-page-container')
          t.end()
        })
      })
    })

    t.test('should NOT /signup again', function (t) {
      baseRequest({url: '/signup'}, function (err, res, body) {
        rq({followRedirect: false, method: 'post', url: '/signup', form: {type: 'email', uuid: 'steve@test.com', password: 'test1234', repeat_password: 'test1234'}}, function ($, res) {
          t.ok($('.signup-container').html(), 'has signup-container')
          t.end()
        })
      })
    })

    expect.universalAppSpecsToPass(t)
    t.end()
  })
})
