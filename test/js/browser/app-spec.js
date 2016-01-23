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
    expect.universalAppSpecsToPass(t)
    t.end()
  })
})
