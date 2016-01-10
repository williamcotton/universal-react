module.exports = function (options) {
  var defaultTitle = options.defaultTitle
  var nodeEnv = options.nodeEnv

  /*

    app
    ---
    server version

  */

  require('node-jsx').install({extension: '.jsx'})
  var RootComponent = require('../../jsx/root-component.jsx')

  var express = require('express')
  var app = express()

  var compression = require('compression')
  app.use(compression())

  var bodyParser = require('body-parser')
  app.use(bodyParser.urlencoded({ extended: false }))

  var fs = require('fs')
  var template = fs.readFileSync(__dirname + '/../../ejs/index.ejs', 'utf8')

  var reactRenderApp = require('./react-render-app') // require('expect-server-render-app')
  app.use(reactRenderApp({
    template: template,
    app: app,
    RootComponent: RootComponent,
    browserEnv: {
      nodeEnv: nodeEnv
    },
    defaultTitle: defaultTitle,
    rootDOMId: 'universal-app-container'
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
