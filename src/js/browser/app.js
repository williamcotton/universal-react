module.exports = function (options) {
  var browserEnv = options.browserEnv

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

  var reactRenderApp = require('./react-render-app')

  app.use(reactRenderApp({
    RootComponent: RootComponent,
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
