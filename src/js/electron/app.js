module.exports = function (options) {
  var browserEnv = options.browserEnv
  var request = options.request

  /*

    app
    ---
    electron browser version

  */

  var App = require('../../jsx/app.jsx')

  var express = require('browser-express')
  var app = express({
    interceptLinks: true,
    interceptFormSubmit: true,
    abstractNavigation: true, // abstract navigation means it does not use browser history and page navigation, which is fine because desktop apps don't need to affect or be affected by the UI related to URLs
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