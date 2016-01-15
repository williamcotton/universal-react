var test = require('tapes')

var universalAppSpec = require('../universal-app-spec')
var serverApp = require('../../../src/js/server/app.js')
var defaultTitle = 'Test'

test('serverApp', function (t) {
  var testServerApp = require('./test-server-app')({
    serverApp: serverApp,
    defaultTitle: defaultTitle
  })

  require('./abstract-expect-server-app')({
    testServerApp: testServerApp,
    universalAppSpec: universalAppSpec,
    defaultTitle: defaultTitle,
    t: t
  }, function (expect, t, rq) {
    // these tests are run only for the serverApp

    t.test('should /signup (redirect disabled)', function (t) {
      rq({url: '/signup'}, function () {
        rq({followRedirect: false, method: 'post', url: '/signup', form: {type: 'email', uuid: 'steve@test.com', password: 'test1234', repeat_password: 'test1234'}}, function ($, res) {
          t.equal(res.headers.location, '/welcome', 'redirects to /welcome')
          t.end()
        })
      })
    })

    t.test('should /signup.json', function (t) {
      rq({url: '/signup'}, function () {
        rq({method: 'post', url: '/signup.json', form: {type: 'email', uuid: 'steve1@test.com', password: 'test1234', repeat_password: 'test1234'}}, function ($, res) {
          var user = JSON.parse(res.body)
          t.equal(user.uuid, 'steve1@test.com')
          t.equal(user.type, 'email')
          t.end()
        })
      })
    })

    t.test('should /login.json', function (t) {
      rq({url: '/login'}, function () {
        rq({method: 'post', url: '/login.json', form: {type: 'email', uuid: 'steve1@test.com', password: 'test1234'}}, function ($, res) {
          var user = JSON.parse(res.body)
          t.equal(user.uuid, 'steve1@test.com')
          t.equal(user.type, 'email')
          t.end()
        })
      })
    })

    t.test('should NOT /signup.json with existing', function (t) {
      rq({url: '/signup'}, function () {
        rq({method: 'post', url: '/signup.json', form: {type: 'email', uuid: 'steve1@test.com', password: 'test1234', repeat_password: 'test1234'}}, function ($, res) {
          var user = JSON.parse(res.body)
          t.equal(user.uuid, undefined)
          t.equal(user.type, undefined)
          t.end()
        })
      })
    })

    expect.universalAppSpecsToPass(t)

    t.end()
  })
})
