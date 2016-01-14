var test = require('tapes')

var universalAppSpec = require('../universal-app-spec')
var serverApp = require('../../../src/js/server/app.js')
var defaultTitle = 'Test'

test('serverApp', function (t) {
  var userAuthenticationDataStore = require('../../../src/js/server/expect-mem-user-authentication-data-store')()

  require('./abstract-expect-server-app')({
    serverApp: serverApp,
    universalAppSpec: universalAppSpec,
    defaultTitle: defaultTitle,
    serverAppConfig: {
      userAuthenticationDataStore: userAuthenticationDataStore
    },
    t: t
  }, function (expect, t, rq) {
    t.test('should /signup (redirect disabled)', function (t) {
      rq({url: '/signup'}, function () {
        rq({followRedirect: false, method: 'post', url: '/signup', form: {email: 'steve@test.com', password: 'test1234', repeat_password: 'test1234'}}, function ($, res) {
          t.equal(res.headers.location, '/welcome', 'redirects to /welcome')
          t.end()
        })
      })
    })

    expect.universalAppSpecsToPass(t)

    t.end()
  })
})
