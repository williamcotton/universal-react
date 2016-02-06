var test = require('tapes')
var urlparse = require('url').parse

var universalAppSpec = require('../universal-app-spec')
var serverApp = require('../../../src/js/server/app.js')
var defaultTitle = 'Test'

test('serverApp', function (t) {
  var nullOp = function (options, callback) {
    callback(false, true)
  }

  var emailService = {
    sendVerificationUrl: nullOp,
    sendResetPasswordUrl: nullOp
  }

  var testServerApp = require('./test-server-app')({
    serverApp: serverApp,
    defaultTitle: defaultTitle,
    emailService: emailService
  })

  require('./abstract-expect-server-app')({
    testServerApp: testServerApp,
    universalAppSpec: universalAppSpec,
    defaultTitle: defaultTitle,
    t: t
  }, function (expect, t, rq, baseRequest) {
    var uuid = 'server-user-0@test.com'
    var anotherUuid = 'server-user-1@test.com'
    var password = 'test1234'
    var newPassword = 'test1111'

    expect.universalAppSpecsToPass(t)

    t.end()
  })
})
