require('node-jsx').install({extension: '.jsx'})

var nodeEnv = process.env.NODE_ENV
var defaultTitle = process.env.DEFAULT_TITLE
var EXPECT_POSTGRES_USER_AUTHENTICATION_DATA_STORE_URL = process.env.EXPECT_POSTGRES_USER_AUTHENTICATION_DATA_STORE_URL
var BOOKSHELF_MODELS = process.env.BOOKSHELF_MODELS
var port = process.env.PORT || 5000

var pg = require('pg')

var knex = require('knex')({
  client: 'pg',
  debug: false,
  connection: BOOKSHELF_MODELS
})

var emailService

var bookshelf = require('bookshelf')(knex)

pg.connect(EXPECT_POSTGRES_USER_AUTHENTICATION_DATA_STORE_URL, function (err, pgClient, done) {
  if (err) {}

  var userAuthenticationDataStore = require('../lib/expect-postgres-user-authentication-data-store')({
    pgClient: pgClient
  })

  var universalServerApp = require('./app')({
    port: port,
    defaultTitle: defaultTitle,
    nodeEnv: nodeEnv,
    userAuthenticationDataStore: userAuthenticationDataStore,
    emailService: emailService,
    bookshelf: bookshelf
  })

  universalServerApp.listen(port, function () {
    console.log('universalServerApp is running in %s mode on port %s', nodeEnv, port)
  })
})
