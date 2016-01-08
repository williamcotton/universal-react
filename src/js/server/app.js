module.exports = function (options) {
  var defaultTitle = options.defaultTitle
  var nodeEnv = options.nodeEnv
  var port = options.port

  /*

    view template
  */

  var fs = require('fs')
  var template = fs.readFileSync(__dirname + '/../../ejs/index.ejs', 'utf8')

  /*

    app
    ---
    server version

  */

  var React = require('react')
  require('node-jsx').install({extension: '.jsx'})
  var App = require('../../jsx/app.jsx')

  var express = require('express')
  var app = express()

  var compression = require('compression')
  app.use(compression())

  var reactRenderApp = require('./react-render-app')
  app.use(reactRenderApp({
    template: template,
    app: app,
    RootComponent: App,
    browserEnv: {
      nodeEnv: nodeEnv,
      defaultTitle: defaultTitle,
      rootId: 'universal-app-container'
    }
  }))

  /*

    universalApp
    ------------
    server version

  */

  var universalServerApp = require('../../jsx/universal-app.jsx')({
    app: app
  })

  var publicDir = __dirname + '/../../../public'
  app.use(express.static(publicDir))

  return universalServerApp

}
