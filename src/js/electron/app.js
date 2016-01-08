module.exports = function (options) {
  var browserEnv = options.browserEnv
  var request = options.request

  /*

    app
    ---
    browser version

  */

  var App = require('../../jsx/app.jsx')

  var express = require('browser-express')
  var app = express({
    interceptLinks: true,
    abstractNavigation: true,
    document: document,
    window: window
  })

  var reactRenderApp = require('../browser/react-render-app')

  app.use(reactRenderApp({
    RootComponent: App,
    app: app,
    contentProps: {
      browserEnv: browserEnv
    },
    rootDOMId: 'universal-app-container',
    defaultTitle: 'Universal App',
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
