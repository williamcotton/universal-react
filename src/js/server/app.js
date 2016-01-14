module.exports = function (options) {
  var defaultTitle = options.defaultTitle
  var nodeEnv = options.nodeEnv

  /*

    app
    ---
    server version

  */

  var cookieKeys = ['SECRET']
  var userTokenSecret = 'SECRET'

  require('node-jsx').install({extension: '.jsx'})
  var RootComponent = require('../../jsx/root-component.jsx')

  var express = require('express')
  var app = express()

  var fs = require('fs')
  var template = fs.readFileSync(__dirname + '/../../ejs/index.ejs', 'utf8')

  var cookieSession = require('cookie-session')
  app.use(cookieSession({
    keys: cookieKeys
  }))

  var bodyParser = require('body-parser')
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  var csrf = require('csurf')
  app.use(csrf())

  var expectReactRenderer = require('../lib/expect-server-react-renderer')

  var csrfExternal

  expectReactRenderer.use(function (req, res, contentProps, rootProps, browserEnv, serverSession, next) { // this can be a plugin
    var csrf = req.csrfToken()
    contentProps.csrf = csrf
    serverSession.csrf = csrf
    csrfExternal = csrf
    next()
  })

  var userAuthenticationDataStore = options.userAuthenticationDataStore

  var userAuthenticationService = require('../lib/expect-user-authentication-service')({
    userAuthenticationDataStore: userAuthenticationDataStore,
    userTokenSecret: userTokenSecret,
    userTokenExpiresIn: '7d'
  })

  app.use(require('../lib/expect-server-user-authentication')({
    app: app,
    userAuthenticationService: userAuthenticationService,
    expectReactRenderer: expectReactRenderer
  }))

  app.use(expectReactRenderer({
    RootComponent: RootComponent,
    app: app,
    defaultTitle: defaultTitle,
    rootDOMId: 'universal-app-container',
    template: template,
    browserEnv: {
      nodeEnv: nodeEnv
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

  // var compression = require('compression')
  // app.use(compression())

  universalServerApp.getCsrf = function() {
    return csrfExternal
  }

  return universalServerApp
}
