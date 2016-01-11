var test = require('tapes')

var universalAppSpec = require('../universal-app-spec')
var browserApp = require('../../../src/js/browser/app.js')
var defaultTitle = 'Test'

test('browserApp', function (t) {
  require('./abstract-expect-browser-app')({
    browserApp: browserApp,
    universalAppSpec: universalAppSpec,
    defaultTitle: defaultTitle,
    t: t
  }, function (expect) {
    expect.universalAppSpecsToPass(t)
    t.end()
  })
})
