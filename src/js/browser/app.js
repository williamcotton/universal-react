module.exports = function (options) {
  var browserEnv = options.browserEnv
  var serverSession = options.serverSession
  var request = options.request
  var localStorage = options.localStorage

  /*

    browser-express app
    -------------------

    expect-browser-react-renderer
    -----------------------------

  */

  var express = require('browser-express')
  var app = express({
    interceptLinks: true,
    interceptFormSubmit: true,
    document: options.document,
    window: options.window
  })

  var expectReactRenderer = require('../lib/expect-browser-react-renderer') // require('expect-browser-render-app')

  /*

    browser-express app middleware
    ------------------------------

    expect-browser-react-renderer middleware
    ----------------------------------------

  */

  // expect-browser-localstorage-session
  app.use(require('../lib/expect-browser-localstorage-session')({
    localStorage: localStorage
  }))

  // expect-browser-csrf
  expectReactRenderer.use(function (req, res, contentProps, rootProps, browserEnv, serverSession, next) { // this can be a plugin
    contentProps.csrf = serverSession.csrf
    next()
  })

  // expect-browser-user-authentication
  app.use(require('../lib/expect-browser-user-authentication')({
    expectReactRenderer: expectReactRenderer,
    request: request
  }))

  // expect-browser-react-renderer
  app.use(expectReactRenderer({
    RootComponent: require('../../jsx/root-component.jsx'),
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
