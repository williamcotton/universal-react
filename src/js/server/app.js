require('node-jsx').install({extension: '.jsx'})

module.exports = function (options) {
  var defaultTitle = options.defaultTitle

  /*

    express app
    -----------

    expect-server-react-renderer
    ----------------------------

  */

  var express = require('express')
  var app = express()

  var expectReactRenderer = require('../lib/expect-server-react-renderer')

  /*

    express app middleware
    ----------------------

    expect-server-react-renderer middleware
    ---------------------------------------

  */

  // cookie-session
  var cookieSession = require('cookie-session')
  var cookieKeys = ['SECRET']
  app.use(cookieSession({
    keys: cookieKeys
  }))

  // body-parser
  var bodyParser = require('body-parser')
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  // csurf
  var csrf = require('csurf')
  app.use(csrf())

  // expect-server-csrf
  expectReactRenderer.use(require('../lib/expect-server-csrf')({
    app: app
  }))

  // expect-server-user-authentication
  var userAuthenticationService = require('../lib/expect-user-authentication-service')({
    userAuthenticationDataStore: options.userAuthenticationDataStore,
    userTokenSecret: 'SECRET',
    userTokenExpiresIn: '7d'
  })
  app.use(require('../lib/expect-server-user-authentication')({
    app: app,
    userAuthenticationService: userAuthenticationService,
    expectReactRenderer: expectReactRenderer
  }))

  // expect-base-template
  var fs = require('fs')
  var template = fs.readFileSync(__dirname + '/../../ejs/index.ejs', 'utf8')

  // expect-server-react-renderer
  app.use(expectReactRenderer({
    RootComponent: require('../../jsx/root-component.jsx'),
    app: app,
    defaultTitle: defaultTitle,
    rootDOMId: 'universal-app-container',
    template: template
  }))

  /*

    universalApp
    ------------
    server version

  */

  var universalServerApp = require('../../jsx/universal-app.jsx')({
    app: app
  })

  // static assets
  var publicDir = __dirname + '/../../../public'
  app.use(express.static(publicDir))

  // compression
  var compression = require('compression')
  app.use(compression())

  return universalServerApp
}
