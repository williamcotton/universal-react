module.exports = function (options) {
  var defaultTitle = options.defaultTitle
  var rq = options.rq
  var t = options.t
  var baseRequest = options.baseRequest

  var expectUniversalApp = require('./abstract-expect-universal-app')({
    t: t, rq: rq,
    defaultTitle: defaultTitle,
    universalApp: require('../../src/jsx/universal-app.jsx')
  })

  expectUniversalApp.rootComponentToBeRendered(t)
  expectUniversalApp.defaultTitleToBeRendered(t)
  expectUniversalApp.allGetRoutesToBeRendered(t, {ignore: []})
  expectUniversalApp.getRouteClasses(t)

}
