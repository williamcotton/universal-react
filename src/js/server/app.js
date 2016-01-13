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

  var expectReactRenderer = require('./react-render-app') // require('expect-react-renderer/server')

  // https://stormpath.com/blog/where-to-store-your-jwts-cookies-vs-html5-web-storage/
  // https://www.npmjs.com/package/bcrypt
  // http://codahale.com/how-to-safely-store-a-password/
  // https://github.com/expressjs/csurf

  // csrf

  var cookieSession = require('cookie-session')
  app.use(cookieSession({
    keys: cookieKeys
  }))

  var bodyParser = require('body-parser')
  app.use(bodyParser.urlencoded({ extended: false }))

  var csrf = require('csurf')
  app.use(csrf())

  app.use(function (req, res, next) { // this can be a plugin
    req.csrf = req.csrfToken()
    next()
  })

  expectReactRenderer.use(function (req, res, contentProps, rootProps, browserEnv, next) { // this can be a plugin
    contentProps.csrf = req.csrf
    next()
  })

  // userToken

  var userAuthenticationDataStore = options.userAuthenticationDataStore

  var userAuthenticationService = require('./user-authentication-service')({
    userAuthenticationDataStore: userAuthenticationDataStore,
    userTokenSecret: userTokenSecret,
    userTokenExpiresIn: '7d'
  })

  app.use(require('./expect-user-authentication-service')({
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

  return universalServerApp
}
