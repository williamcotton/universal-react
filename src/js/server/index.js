require('node-jsx').install({extension: '.jsx'})

var nodeEnv = process.env.NODE_ENV
var defaultTitle = process.env.DEFAULT_TITLE
var EXPECT_POSTGRES_USER_AUTHENTICATION_DATA_STORE_URL = process.env.EXPECT_POSTGRES_USER_AUTHENTICATION_DATA_STORE_URL
var BOOKSHELF_MODELS = process.env.BOOKSHELF_MODELS
var port = process.env.PORT || 5000
var SENDGRID_APP_SECRET = process.env.SENDGRID_APP_SECRET
var SENDGRID_APP_ID = process.env.SENDGRID_APP_ID

var sendgrid = require('sendgrid')(SENDGRID_APP_ID, SENDGRID_APP_SECRET)

var emailService = {
  sendVerificationUrl: function (options, callback) {
    var emailAddress = options.emailAddress
    var verificationUrl = options.verificationUrl
    var payload = {
      to: emailAddress,
      from: 'admin@acme-inc.com',
      subject: 'Email Verification',
      text: 'Thanks for signing up with Acme, Inc. \n\nPlease visit this link to complete your account creation: \n\n' + verificationUrl
    }
    console.log(payload)
    //sendgrid.send(payload, callback)
  },
  sendPasswordResetUrl: function (options, callback) {
    var emailAddress = options.emailAddress
    var passwordResetUrl = options.passwordResetUrl
    var payload = {
      to: emailAddress,
      from: 'admin@acme-inc.com',
      subject: 'Password Reset',
      text: 'We received a request to change your password with Acme, Inc. \n\nPlease visit this link to set your new password: \n\n' + passwordResetUrl
    }
    console.log(payload)
    //sendgrid.send(payload, callback)
  }
}

var pg = require('pg')

var knex = require('knex')({
  client: 'pg',
  debug: false,
  connection: BOOKSHELF_MODELS
})

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
