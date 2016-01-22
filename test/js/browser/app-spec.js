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
  }, function (expect, t, rq, baseRequest) {
    t.test('should /signup', function (t) {
      baseRequest({url: '/signup'}, function (err, res, body) {
        rq({followRedirect: false, method: 'post', url: '/signup', form: {type: 'email', uuid: 'steve@test.com', password: 'test1234', repeatPassword: 'test1234'}}, function ($, res) {
          t.equal(res.headers.location, '/welcome', 'redirect to /wecome')
          t.end()
        })
      })
    })

    t.test('should /login', function (t) {
      baseRequest({url: '/login'}, function (err, res, body) {
        rq({followRedirect: false, method: 'post', url: '/login', form: {type: 'email', uuid: 'steve@test.com', password: 'test1234'}}, function ($, res) {
          t.equal(res.headers.location, '/welcome', 'redirect to /welcome')
          t.end()
        })
      })
    })

    t.test('should NOT /signup again with existing uuid', function (t) {
      baseRequest({url: '/signup'}, function (err, res, body) {
        rq({followRedirect: false, method: 'post', url: '/signup', form: {type: 'email', uuid: 'steve@test.com', password: 'test1234', repeatPassword: 'test1234'}}, function ($, res) {
          t.equal(res.headers.location, undefined, 'no redirect')
          t.ok($('.signup-container').html(), 'has signup-container')
          t.end()
        })
      })
    })

    expect.universalAppSpecsToPass(t)
    t.end()
  })
})
