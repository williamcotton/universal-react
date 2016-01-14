module.exports = function (options) {
  var browserEnv = options.browserEnv
  var serverSession = options.serverSession
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

  var expectReactRenderer = require('./react-render-app') // require('expect-browser-render-app')

  expectReactRenderer.use(function (req, res, contentProps, rootProps, browserEnv, serverSession, next) { // this can be a plugin
    contentProps.csrf = serverSession.csrf
    next()
  })

  app.use(require('./expect-browser-user-authentication')({
    expectReactRenderer: expectReactRenderer
  }))

  app.use(expectReactRenderer({
    RootComponent: RootComponent,
    app: app,
    rootDOMId: 'universal-app-container',
    defaultTitle: options.defaultTitle || 'Universal App',
    browserEnv: browserEnv,
    serverSession: serverSession,
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
