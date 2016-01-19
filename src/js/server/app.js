module.exports = function (options) {
  var defaultTitle = options.defaultTitle

  var fs = require('fs')

  var rsaPrivateKeyPem = fs.readFileSync(__dirname + '/../../../expect-user-authentication-service.pem')
  var rsaPublicKeyPem = fs.readFileSync(__dirname + '/../../../expect-user-authentication-service-public.pem')

  var userAuthenticationService = require('../lib/expect-user-authentication-service')({
    userAuthenticationDataStore: options.userAuthenticationDataStore,
    rsaPrivateKeyPem: rsaPrivateKeyPem,
    rsaPublicKeyPem: rsaPublicKeyPem,
    userTokenExpiresIn: '7d'
  })

  /*

    express app
    -----------

    expect-server-react-renderer
    ----------------------------

  */

  var express = require('express')
  var app = options.app || express()

  var expectReactRenderer = require('../lib/expect-server-react-renderer')

  /*

    express app middleware
    ----------------------

    expect-server-react-renderer middleware
    ---------------------------------------

  */

  // expect-server-user-authentication
  app.use(require('../lib/expect-server-user-authentication')({
    app: app,
    userAuthenticationService: userAuthenticationService,
    expectReactRenderer: expectReactRenderer
  }))

  // expect-server-template
  var template = fs.readFileSync(__dirname + '/../../ejs/index.ejs', 'utf8')

  // expect-server-react-renderer
  app.use(expectReactRenderer({
    RootComponent: require('../../jsx/root-component.jsx'),
    app: app,
    defaultTitle: defaultTitle,
    rootDOMId: 'universal-app-container',
    template: template
  }))

  app.post('/user.json', function (req, res) {
    res.send(req.user)
  })

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
