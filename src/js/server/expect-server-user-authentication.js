var validator = require('validator')

var validateCredentials = function (credentials) {
  var errors = []
  var valid = false
  if (credentials.type === 'email') {
    var email = credentials.uuid
    var password = credentials.password
    var repeatPassword = credentials.repeatPassword
    if (!validator.isEmail(email)) {
      errors.push('EMAIL_INVALID')
    }
    if (password.length < 8) {
      errors.push('PASSWORD_TOOSHORT')
    }
    if (password !== repeatPassword) {
      errors.push('PASSWORD_MISMATCH')
    }
  } else {
    errors.push('TYPE_INVALID')
  }
  if (errors.length === 0) {
    errors = false
    valid = true
  }
  return {
    errors: errors,
    valid: valid
  }
}

module.exports = function (options) {
  var userAuthenticationService = options.userAuthenticationService
  var expectReactRenderer = options.expectReactRenderer

  expectReactRenderer.use(function (req, res, contentProps, rootProps, browserEnv, serverSession, next) { // this can be a plugin
    if (req.user) {
      var user = {
        type: req.user.type,
        uuid: req.user.uuid
      }
      contentProps.user = user
      rootProps.user = user
      serverSession.user = user
    }
    next()
  })

  return function (req, res, next) { // this can be a plugin
    req.signup = function (credentials, callback) {
      var credentialStatus = validateCredentials(credentials)
      if (credentialStatus.errors) {
        return callback(credentialStatus.errors)
      }
      userAuthenticationService.createUser(credentials, function (err, user) {
        if (err || !user) {
          var errors = [err]
          return callback(errors)
        }
        req.login(credentials, callback)
      })
    }
    req.login = function (credentials, callback) {
      userAuthenticationService.loginServerSessionUserToken(credentials, function (err, user, token) {
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
