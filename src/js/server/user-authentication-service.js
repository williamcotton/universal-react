var jwt = require('jsonwebtoken')
var bcrypt = require('bcrypt')

module.exports = function (options) {
  var userTokenSecret = options.userTokenSecret
  var userTokenPublicKey = options.userTokenPublicKey
  var userAuthenticationDataStore = options.userAuthenticationDataStore
  var userTokenExpiresIn = options.userTokenExpiresIn
  return { // interface with user credential data store
    loginServerSessionUserToken: function (credentials, callback) { // verify that email and hash(password) match, issue token for existing account
      userAuthenticationDataStore.getHash(credentials, function (errHashLookup, hash) {
        bcrypt.compare(credentials.password, hash, function (errHashCompare, res) {
          if (!errHashCompare && !errHashLookup && res) {
            var user = { uuid: credentials.uuid, type: credentials.type }
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
    createUser: function (credentials, callback) { // issue token and create new account, storing email and hash(password)
      userAuthenticationDataStore.getHash(credentials, function (errHashLookup, hash) {
        if (hash) {
          return callback('UUID_FOR_TYPE_EXISTS')
        }
        bcrypt.genSalt(10, function (errGetSalt, salt) {
          bcrypt.hash(credentials.password, salt, function (errGetHash, hash) {
            userAuthenticationDataStore.create(credentials, hash, function (err, newUser) {
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
    destroyUser: function (credentials, callback) {
      userAuthenticationDataStore.getHash(credentials, function (errHashLookup, hash) {
        bcrypt.compare(credentials.password, hash, function (errHashCompare, res) {
          if (!errHashCompare && !errHashLookup && res) {
            userAuthenticationDataStore.destroy(credentials, callback)
          } else {
            callback(true)
          }
        })
      })
    }
  }
}
