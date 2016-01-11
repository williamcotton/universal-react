module.exports = function (options) {
  var browserEnv = options.browserEnv
  var request = options.request

  /*

    app
    ---
    browser version

  */

  var RootComponent = require('../../jsx/root-component.jsx')

  var express = require('browser-express')
  var app = express({
    interceptLinks: true,
    interceptFormSubmit: true,
    document: options.document,
    window: options.window
  })

  /*
    
    CSRF can be kept completely away from browser-express...

    Because browser-express is intercepting all links and form submit events, we can just make sure that if we DO need to do remote requests,
    we do so in a manner that makes sure to grab a CSRF token and attach it to a remote request

    the same goes for the JWT stored in a cookie

  */

  app.use(function (req, res, next) {
    req.user = {name: 'test'}
    next()
  })

  var expectRenderApp = require('./react-render-app') // require('expect-browser-render-app')

  expectRenderApp.use(function (req, res, contentProps, rootProps, next) {
    contentProps.user = req.user
    next()
  })

  app.use(expectRenderApp({
    RootComponent: RootComponent,
    app: app,
    rootDOMId: 'universal-app-container',
    defaultTitle: options.defaultTitle || 'Universal App',
    browserEnv: browserEnv,
    document: options.document,
    localStorage: options.localStorage
  }))

  /*

    universalApp
    ------------
    browser version

  */

  var universalBrowserApp = require('../../jsx/universal-app.jsx')({
    app: app
  })

  return universalBrowserApp
}
