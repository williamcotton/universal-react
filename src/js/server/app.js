module.exports = function (options) {
  var defaultTitle = options.defaultTitle
  var nodeEnv = options.nodeEnv

  /*

    app
    ---
    server version

  */

  var cookieKeys = ['SECRET']
  var authTokenKey = 'SECRET'

  require('node-jsx').install({extension: '.jsx'})
  var RootComponent = require('../../jsx/root-component.jsx')

  var jwt = require('jsonwebtoken')

  var express = require('express')
  var app = express()

  var cookieSession = require('cookie-session')
  app.use(cookieSession({
    keys: cookieKeys
  }))

  var cookieParser = require('cookie-parser')
  app.use(cookieParser(cookieKeys, {httpOnly: true}))

  var bodyParser = require('body-parser')
  app.use(bodyParser.urlencoded({ extended: false }))

  var csrf = require('csurf')
  app.use(csrf())

  var compression = require('compression')
  app.use(compression())

  var fs = require('fs')
  var template = fs.readFileSync(__dirname + '/../../ejs/index.ejs', 'utf8')

  var reactRenderApp = require('./react-render-app') // require('expect-server-render-app')

  // https://stormpath.com/blog/where-to-store-your-jwts-cookies-vs-html5-web-storage/
  // https://www.npmjs.com/package/bcrypt
  // http://codahale.com/how-to-safely-store-a-password/
  // https://github.com/expressjs/csurf

  app.use(function (req, res, next) {
    req.csrf = req.csrfToken()
    req.login = function (uuid, password, callback) {
      var userData = { uuid: uuid }
      jwt.sign(userData, authTokenKey, {}, function (token) {
        req.user = userData
        req.session = {
          userToken: token
        }
        callback(false)
      })
    }
    req.logout = function (callback) {
      req.user = null
      delete req.session.userToken
      callback()
    }
    if (req.session && req.session.userToken) {
      jwt.verify(req.session.userToken, authTokenKey, function (err, userData) {
        req.user = userData
        next()
      })
    } else {
      next()
    }
  })

  reactRenderApp.use(function (req, res, contentProps, rootProps, browserEnv, next) {
    contentProps.csrf = req.csrf
    contentProps.user = req.user
    rootProps.user = req.user
    next()
  })

  app.use(reactRenderApp({
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

  return universalServerApp
}
