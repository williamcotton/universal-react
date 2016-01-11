var test = require('tapes')

var universalAppSpec = require('../universal-app-spec')
var serverApp = require('../../../src/js/server/app.js')
var defaultTitle = 'Test'

test('serverApp', function (t) {
  require('./abstract-expect-server-app')({
    serverApp: serverApp,
    universalAppSpec: universalAppSpec,
    defaultTitle: defaultTitle,
    t: t
  }, function (expect) {
    expect.universalAppSpecsToPass(t)
    t.end()
  })
})
