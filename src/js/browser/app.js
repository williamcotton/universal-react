module.exports = function (options) {
  var browserEnv = options.browserEnv

  /*

    app
    ---
    browser version

  */

  var App = require('../../jsx/app.jsx')

  var express = require('browser-express')
  var app = express({
    interceptLinks: true,
    interceptFormSubmit: true,
    document: document,
    window: window
  })

  var reactRenderApp = require('./react-render-app')

  app.use(reactRenderApp({
    RootComponent: App,
    app: app,
    contentProps: {
      browserEnv: browserEnv
    },
    rootDOMId: 'universal-app-container',
    defaultTitle: options.defaultTitle || 'Universal App',
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
