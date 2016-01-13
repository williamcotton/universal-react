var jwt = require('jsonwebtoken')
var bcrypt = require('bcrypt')

module.exports = function (options) {
  var userTokenSecret = options.userTokenSecret
  var userTokenPublicKey = options.userTokenPublicKey
  var userAuthenticationDataStore = options.userAuthenticationDataStore
  var userTokenExpiresIn = options.userTokenExpiresIn
  return { // interface with user credential data store
    loginServerSessionUserToken: function (email, password, callback) { // verify that email and hash(password) match, issue token for existing account
      userAuthenticationDataStore.getHash(email, function (errHashLookup, hash) {
        bcrypt.compare(password, hash, function (errHashCompare, res) {
          if (!errHashCompare && !errHashLookup && res) {
            var user = { email: email }
            jwt.sign(user, userTokenSecret, {expiresIn: userTokenExpiresIn, issuer: 'expect-user-auth', audience: 'expect-server-session-user'}, function (serverSessionUserToken) {
              callback(false, user, serverSessionUserToken)
            })
          } else {
            callback(true, false, false)
          }
        })
      })
    },
    verifyServerSessionUserToken: function (serverSessionUserToken, callback) { // verify token
      jwt.verify(serverSessionUserToken, userTokenSecret, {audience: 'expect-server-session-user', issuer: 'expect-user-auth'}, function (err, user) {
        callback(err || !user, user)
      })
    },
    refreshServerSessionUserToken: function (serverSessionUserToken, callback) { // verify token and create a new one to extend the lifetime
      jwt.verify(serverSessionUserToken, userTokenSecret, {audience: 'expect-server-session-user', issuer: 'expect-user-auth'}, function (err, user) {
        if (err) {
          return callback(err, false)
        }
        jwt.sign(user, userTokenSecret, {expiresIn: userTokenExpiresIn, issuer: 'expect-user-auth', audience: 'expect-server-session-user'}, function (serverSessionUserToken) {
          callback(false, user, serverSessionUserToken)
        })
      })
    },
    createUser: function (email, password, callback) { // issue token and create new account, storing email and hash(password)
      userAuthenticationDataStore.getHash(email, function (errHashLookup, hash) {
        if (hash) {
          return callback('EMAIL_EXISTS')
        }
        bcrypt.genSalt(10, function (errGetSalt, salt) {
          bcrypt.hash(password, salt, function (errGetHash, hash) {
            userAuthenticationDataStore.create(email, hash, function (err, newUser) {
              if (err) {
                callback('CREATE_ERROR')
              } else {
                callback(false, newUser)
              }
            })
          })
        })
      })
    },
    destroyUser: function (email, password, callback) {
      userAuthenticationDataStore.getHash(email, function (errHashLookup, hash) {
        bcrypt.compare(password, hash, function (errHashCompare, res) {
          if (!errHashCompare && !errHashLookup && res) {
            userAuthenticationDataStore.destroy(email, callback)
          } else {
            callback(true)
          }
        })
      })
    }
  }
}
