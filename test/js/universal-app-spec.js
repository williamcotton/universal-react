module.exports = function (options) {
  var defaultTitle = options.defaultTitle
  var rq = options.rq
  var t = options.t

  var expect = require('./abstract-expect-universal-app')({
    defaultTitle: defaultTitle,
    t: t,
    rq: rq,
    universalApp: require('../../src/jsx/universal-app.jsx')
  })

  expect.rootComponentToBeRendered(t)
  expect.defaultTitleToBeRendered(t)
  expect.allGetRoutesToBeRendered(t)
  expect.getRouteClasses(t)

  t.test('should POST /calculate and get the correct result', function (t) {
    rq({method: 'post', url: '/calculator', form: {firstNumber: 12, secondNumber: 34, operation: '+'}}, function ($) {
      t.equal($('.result').html(), '12 + 34 = 46', 'result was 12 + 34 = 46')
      t.end()
    })
  })

  t.test('should POST /calculate and get back nothing when using incorrect operation type', function (t) {
    rq({method: 'post', url: '/calculator', form: {firstNumber: 12, secondNumber: 34, operation: 3}}, function ($) {
      t.equal($('.result').html(), '', 'result was blank')
      t.end()
    })
  })
}
