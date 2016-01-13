/*

  this module acts as middleware for both an express app instance and an expectRenderer instance

  req.create()
  req.login()
  req.logout()
  req.destroy()

  req.user
  contentProps.user
  rootProps.user

  it uses json web tokens stored in an httpOnly cookie-based session

  it consumes a userAuthenticationService

*/

var validator = require('validator')

module.exports = function (options) {
  var userAuthenticationService = options.userAuthenticationService
  var expectReactRenderer = options.expectReactRenderer

  expectReactRenderer.use(function (req, res, contentProps, rootProps, browserEnv, next) { // this can be a plugin
    contentProps.user = req.user
    rootProps.user = req.user
    next()
  })

  return function (req, res, next) { // this can be a plugin
    req.signup = function (email, password, repeat_password, callback) {
      var signupError
      if (!validator.isEmail(email)) {
        signupError = 'EMAIL_INVALID'
      } else if (password.length < 8) {
        signupError = 'PASSWORD_TOOSHORT'
      } else if (password !== repeat_password) {
        signupError = 'PASSWORD_MISMATCH'
      }
      if (signupError) {
        return callback(signupError)
      }
      userAuthenticationService.createUser(email, password, function (err, user) {
        if (err || !user) {
          return callback(err)
        }
        req.login(email, password, callback)
      })
    }
    req.login = function (email, password, callback) {
      userAuthenticationService.loginServerSessionUserToken(email, password, function (err, user, token) {
        if (err || !token || !user) {
          return callback(err)
        }
        req.user = user
        req.session.userToken = token
        callback(false)
      })
    }
    req.logout = function (callback) {
      delete req.user
      delete req.session.userToken
      callback()
    }
    if (req.session && req.session.userToken) {
      userAuthenticationService.refreshServerSessionUserToken(req.session.userToken, function (err, user, token) {
        if (!err && user && token) {
          req.user = user
          req.session.userToken = token
        }
        next()
      })
    } else {
      next()
    }
  }
}
