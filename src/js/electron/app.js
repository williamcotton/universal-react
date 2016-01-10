module.exports = function (options) {
  var browserEnv = options.browserEnv

  /*

    app
    ---
    electron browser version

  */

  var RootComponent = require('../../jsx/root-component.jsx')

  var express = require('browser-express')
  var app = express({
    interceptLinks: true,
    interceptFormSubmit: true,
    abstractNavigation: true, // abstract navigation means it does not use browser history and page navigation, which is fine because desktop apps don't need to affect or be affected by the UI related to URLs
    document: options.document,
    window: options.window
  })

  var reactRenderApp = require('../browser/react-render-app')

  app.use(reactRenderApp({
    RootComponent: RootComponent,
    app: app,
    contentProps: {
      browserEnv: browserEnv
    },
    rootDOMId: 'universal-app-container',
    defaultTitle: 'Universal App',
    document: options.document,
    localStorage: options.localStorage
  }))

  // expect-server-render-app
  // expect-browser-render-app

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
