module.exports = function (options) {
  /*

    app
    ---
    electron browser version

  */

  var express = require('browser-express')
  var app = express({
    interceptLinks: true,
    interceptFormSubmit: true,
    abstractNavigation: true, // abstract navigation means it does not use browser history and page navigation, which is fine because desktop apps don't need to affect or be affected by the UI related to URLs
    document: options.document,
    window: options.window
  })

  var expectReactRenderer = require('../lib/expect-browser-react-renderer')

  app.use(expectReactRenderer({
    RootComponent: require('../../jsx/root-component.jsx'),
    app: app,
    rootDOMId: 'universal-app-container',
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
