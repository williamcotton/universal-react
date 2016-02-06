var jwt = require('jsonwebtoken')
var bcrypt = require('bcrypt')

module.exports = function (options) {
  var userAuthenticationDataStore = options.userAuthenticationDataStore
  var emailService = options.emailService
  var userTokenExpiresIn = options.userTokenExpiresIn
  var verificationPath = options.verificationPath
  var resetPasswordPath = options.resetPasswordPath
  var issuer = options.issuer || 'expect-user-auth' // issuer owns rsaPrivateKeyPem and rsaPublicKeyPem
  var rsaPrivateKeyPem = options.rsaPrivateKeyPem // openssl genrsa -out expect-user-authentication-service.pem 1024
  var rsaPublicKeyPem = options.rsaPublicKeyPem // openssl rsa -in expect-user-authentication-service.pem -pubout -out expect-user-authentication-service-public.pem
  var userAuthenticationService = {
    verificationPath: verificationPath,
    resetPasswordPath: resetPasswordPath,
    getToken: function (options, callback) {
      var credentials = options.credentials
      var password = credentials.password
      var audience = options.audience
      // if type: email
      // TODO: email verification, forgot password reset
      userAuthenticationDataStore.getUserCredentials({uuid: credentials.uuid, type: credentials.type}, function (errHashLookup, existingCredentials) {
        var hash = existingCredentials.hash
        var user = {
          uuid: existingCredentials.user_uuid,
          type: existingCredentials.type,
          verified: existingCredentials.verified
        }
        bcrypt.compare(password, hash, function (errHashCompare, res) {
          if (!errHashCompare && !errHashLookup && res) {
            jwt.sign(user, rsaPrivateKeyPem, {expiresIn: userTokenExpiresIn, issuer: issuer, audience: audience, algorithm: 'RS256'}, function (token) {
              callback(false, user, token)
            })
          } else {
            callback(true, false, false)
          }
        })
      })
      // if type: facebook
      // TODO: check validity of token, check data store for user.uuid for facebook id
    },
    verifyToken: function (options, callback) {
      var token = options.token
      var audience = options.audience
      jwt.verify(token, rsaPublicKeyPem, {issuer: issuer, audience: audience, algorithm: 'RS256'}, function (err, user) {
        callback(err || !user, user)
      })
    },
    refreshToken: function (options, callback) {
      var token = options.token
      var audience = options.audience
      jwt.verify(token, rsaPublicKeyPem, {issuer: issuer, audience: audience, algorithm: 'RS256'}, function (err, user) {
        if (err) {
          return callback(err, false)
        }
        // TODO: it should only sign a new token if the old one is older than 1 hour - we don't need to sign tokens on every request!
        jwt.sign(user, rsaPrivateKeyPem, {expiresIn: userTokenExpiresIn, issuer: issuer, audience: audience, algorithm: 'RS256'}, function (token) {
          callback(false, user, token)
        })
      })
    },
    getCredentials: function (options, callback) {
      userAuthenticationDataStore.getUserCredentials(options, function (err, credentials) {
        callback(err, {
          uuid: credentials.uuid,
          type: credentials.type,
          verified: credentials.verified
        })
      })
    },
    createVerificationUrl: function (options, callback) {
      var audience = 'expect-verification-url'
      var credentials = {
        uuid: options.uuid,
        type: options.type
      }
      jwt.sign(credentials, rsaPrivateKeyPem, {expiresIn: userTokenExpiresIn, issuer: issuer, audience: audience, algorithm: 'RS256'}, function (token) {
        var verificationUrl = options.baseUrl + verificationPath.replace(':token', token)
        callback(false, verificationUrl)
      })
    },
    sendVerificationEmail: function (options, callback) {
      var emailAddress = options.emailAddress
      userAuthenticationService.createVerificationUrl({
        baseUrl: options.baseUrl,
        uuid: emailAddress,
        type: 'email'
      }, function (err, verificationUrl) {
        if (err) return callback(err)
        emailService.sendVerificationUrl({
          emailAddress: emailAddress,
          verificationUrl: verificationUrl
        }, callback)
      })
    },
    verifyVerificationUrlToken: function (options, callback) {
      var audience = 'expect-verification-url'
      var token = options.token
      jwt.verify(token, rsaPublicKeyPem, {issuer: issuer, audience: audience, algorithm: 'RS256'}, function (err, credentials) {
        if (err) return callback(err)
        userAuthenticationDataStore.setVerified({uuid: credentials.uuid}, function (err, verified) {
          if (err) return callback(err)
          credentials.verified = verified
          callback(false, credentials)
        })
      })
    },
    createResetPasswordUrl: function (options, callback) {
      var audience = 'expect-reset-password-url'
      var credentials = {
        uuid: options.uuid,
        type: options.type
      }
      jwt.sign(credentials, rsaPrivateKeyPem, {expiresIn: '10m', issuer: issuer, audience: audience, algorithm: 'RS256'}, function (token) {
        var resetPasswordUrl = options.baseUrl + resetPasswordPath.replace(':token', token)
        callback(false, resetPasswordUrl)
      })
    },
    sendResetPasswordEmail: function (options, callback) {
      var emailAddress = options.emailAddress
      userAuthenticationService.createResetPasswordUrl({
        baseUrl: options.baseUrl,
        uuid: emailAddress,
        type: 'email'
      }, function (err, resetPasswordUrl) {
        if (err) return callback(err)
        emailService.sendResetPasswordUrl({
          emailAddress: emailAddress,
          resetPasswordUrl: resetPasswordUrl
        }, callback)
      })
    },
    verifyResetPasswordUrlToken: function (options, callback) {
      var audience = 'expect-reset-password-url'
      var token = options.token
      jwt.verify(token, rsaPublicKeyPem, {issuer: issuer, audience: audience, algorithm: 'RS256'}, function (err, credentials) {
        if (err && err.name === 'TokenExpiredError') {
          return callback('TOKEN_EXPIRED', false)
        }
        callback(false, credentials)
      })
    },
    setNewPassword: function (options, callback) {
      var audience = 'expect-reset-password-url'
      var token = options.token
      var newPassword = options.newPassword
      jwt.verify(token, rsaPublicKeyPem, {issuer: issuer, audience: audience, algorithm: 'RS256'}, function (err, credentials) {
        if (err || !credentials) {
          return callback(err, false)
        }
        bcrypt.genSalt(10, function (errGetSalt, salt) {
          bcrypt.hash(newPassword, salt, function (errGetHash, hash) {
            if (err) return callback(err)
            userAuthenticationDataStore.setHash({uuid: credentials.uuid, hash: hash}, function (err, hash) {
              if (err) return callback(err)
              callback(false, credentials)
            })
          })
        })
      })
    },
    createUser: function (options, callback) {
      // if type: email
      var uuid = options.uuid
      var type = options.type
      var password = options.password
      var baseUrl = options.baseUrl
      var credentials = {uuid: uuid, type: type}
      userAuthenticationDataStore.getUserCredentials(credentials, function (errHashLookup, existingCredentials) {
        var hash = existingCredentials.hash
        if (hash) {
          return callback('UUID_FOR_TYPE_EXISTS')
        }
        bcrypt.genSalt(10, function (errGetSalt, salt) {
          bcrypt.hash(password, salt, function (errGetHash, hash) {
            credentials.hash = hash
            userAuthenticationDataStore.create(credentials, function (err, newCredentials) {
              var newUser = {
                uuid: newCredentials.user_uuid,
                type: newCredentials.type,
                verified: newCredentials.verified
              }
              if (newUser.type === 'email') {
                userAuthenticationService.sendVerificationEmail({
                  baseUrl: baseUrl,
                  emailAddress: newCredentials.uuid
                }, function () {})
              }
              if (err) {
                callback('CREATE_ERROR')
              } else {
                callback(false, newUser)
              }
            })
          })
        })
      })
      // if type: facebook
      // TODO: check validity of token, check to see if facebook id is there, if not, make a new user and associate it with the facebook id
    },
    // TODO: addNewCredentials - given a valid token and new credentials (phone number, facebook, twitter), create new user_credentials and associate with the token user
    destroyUser: function (credentials, callback) {
      userAuthenticationDataStore.getUserCredentials(credentials, function (errHashLookup, existingCredentials) {
        var hash = existingCredentials.hash
        bcrypt.compare(credentials.password, hash, function (errHashCompare, res) {
          if (!errHashCompare && !errHashLookup && res) {
            userAuthenticationDataStore.destroy(credentials, callback)
          } else {
            callback(true)
          }
        })
      })
    }
    // sign a POST action as a JWT token, authorizing the user - so perhaps middleware that checks req.session.userToken and req.method for POST and signs and notarizes the transaction
    // notarize a POST action with a valid JWT token, issuing another token with a timestamp
  }

  return userAuthenticationService
}
