module.exports = function (options) {
  var request = options.request
  var localStorage = options.localStorage

  /*

    browser-express app
    -------------------

    expect-browser-react-renderer
    -----------------------------

  */

  var express = require('browser-express')
  var app = options.app || express({
    interceptLinks: true,
    interceptFormSubmit: true,
    document: options.document,
    window: options.window
  })

  var expectReactRenderer = require('../lib/expect-browser-react-renderer')

  /*

    browser-express app middleware
    ------------------------------

    expect-browser-react-renderer middleware
    ----------------------------------------

  */

  // expect-browser-user-authentication
  app.use(require('../lib/expect-browser-user-authentication')({
    localStorage: localStorage,
    app: app,
    expectReactRenderer: expectReactRenderer,
    request: request
  }))

  // expect-browser-react-renderer
  app.use(expectReactRenderer({
    RootComponent: require('../../jsx/root-component.jsx'),
    app: app,
    rootDOMId: 'universal-app-container',
    document: options.document,
    localStorage: options.localStorage
  }))

  app.post('/user.json', function (req, res) {
    request({url: '/user.json', method: 'post', json: req.body}, function (err, _res, body) {
      res.send(body)
    })
  })

  var expectApiModel = require('../lib/expect-browser-api-model')

  app.use(expectApiModel({
    tableName: 'songs',
    request: request
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
