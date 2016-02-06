module.exports = function (options) {
  var defaultTitle = options.defaultTitle
  var bookshelf = options.bookshelf

  var fs = require('fs')

  /*

    user authentication service
    ---------------------------

  */

  var rsaPrivateKeyPem = fs.readFileSync(__dirname + '/../../../expect-user-authentication-service.pem')
  var rsaPublicKeyPem = fs.readFileSync(__dirname + '/../../../expect-user-authentication-service-public.pem')

  var userAuthenticationService = require('../lib/expect-user-authentication-service')({
    emailService: options.emailService,
    verificationPath: '/verify/:token',
    resetPasswordPath: '/reset-password/:token',
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
    expectReactRenderer: expectReactRenderer,
    verificationSuccessPath: '/welcome',
    newPasswordPath: '/new-password'
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

  /*

    models
    ------
    bookshelf

  */

  var expectBookshelfModel = require('../lib/expect-server-bookshelf-model')({
    app: app,
    bookshelf: bookshelf
  })

  // Song -> req.songs
  var Song = bookshelf.Model.extend({
    tableName: 'songs'
  })
  app.use(expectBookshelfModel({
    reqProp: 'songs',
    Model: Song,
    beforeFind: function (song, req, res, callback) {
      song.set({read_count: song.get('read_count') + 1})
      song.save()
      callback(song)
    },
    findAll: function (Song) {
      return function (req, res, callback) {
        Song.query('orderBy', 'id', 'asc').fetchAll().then(function (songs) {
          callback(songs.toJSON())
        })
      }
    }
  }))

  /*
    rpc middleware
    --------------
  */

  var expectRpcModel = require('../lib/expect-server-rpc-model')({
    app: app
  })

  /*

    universal app
    -------------
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
