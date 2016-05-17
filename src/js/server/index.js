require('node-jsx').install({extension: '.jsx'})

var nodeEnv = process.env.NODE_ENV
var defaultTitle = process.env.DEFAULT_TITLE
var userAuthConnectionUrl = process.env.EXPECT_POSTGRES_USER_AUTHENTICATION_DATA_STORE_URL
var bookshelfConnection = process.env.BOOKSHELF_MODELS
var port = process.env.PORT || 5000
var sendgridAppSecret = process.env.SENDGRID_APP_SECRET
var sendgridAppId = process.env.SENDGRID_APP_ID

var sendgrid = require('sendgrid')(sendgridAppId, sendgridAppSecret)

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
    if (nodeEnv === 'development') {
      console.log(payload)
    } else {
      sendgrid.send(payload, callback)
    }
    callback(false, payload)
  },
  sendResetPasswordUrl: function (options, callback) {
    var emailAddress = options.emailAddress
    var resetPasswordUrl = options.resetPasswordUrl
    var payload = {
      to: emailAddress,
      from: 'admin@acme-inc.com',
      subject: 'Password Reset',
      text: 'We received a request to change your password with Acme, Inc. \n\nPlease visit this link to set your new password: \n\n' + resetPasswordUrl
    }
    if (nodeEnv === 'development') {
      console.log(payload)
    } else {
      sendgrid.send(payload, callback)
    }
    callback(false, payload)
  }
}

var knex = require('knex')({
  client: 'pg',
  debug: false,
  connection: bookshelfConnection
})

var bookshelf = require('bookshelf')(knex)

var userAuthenticationDataStore = require('../lib/expect-postgres-user-authentication-data-store')({
  connection: userAuthConnectionUrl
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
