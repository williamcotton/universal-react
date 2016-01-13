module.exports = function (options) {
  var defaultTitle = options.defaultTitle
  var rq = options.rq
  var t = options.t

  var expectUniversalApp = require('./abstract-expect-universal-app')({
    t: t, rq: rq,
    defaultTitle: defaultTitle,
    universalApp: require('../../src/jsx/universal-app.jsx')
  })

  expectUniversalApp.rootComponentToBeRendered(t)
  expectUniversalApp.defaultTitleToBeRendered(t)
  expectUniversalApp.allGetRoutesToBeRendered(t, {ignore: ['/logout']})
  expectUniversalApp.getRouteClasses(t)

  t.test('should POST /calculate and get the correct result', function (t) {
    // we get '/calculator' first, to make sure we get a csrf token
    rq({url: '/calculator'}, function ($) {
      rq({method: 'post', url: '/calculator', form: {firstNumber: 12, secondNumber: 34, operation: '+'}}, function ($) {
        t.equal($('.result').html(), '12 + 34 = 46', 'result was 12 + 34 = 46')
        t.end()
      })
    })
  })

  t.test('should POST /calculate and get back nothing when using incorrect operation type', function (t) {
    // we get '/calculator' first, to make sure we get a csrf token
    rq({url: '/calculator'}, function ($) {
      rq({method: 'post', url: '/calculator', form: {firstNumber: 12, secondNumber: 34, operation: 3}}, function ($) {
        t.equal($('.result').html(), '', 'result was blank')
        t.end()
      })
    })
  })
}
