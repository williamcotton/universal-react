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
  var expectReactRenderer = options.expectReactRenderer

  expectReactRenderer.use(function (req, res, contentProps, rootProps, browserEnv, serverSession, next) { // this can be a plugin
    contentProps.user = serverSession.user
    rootProps.user = serverSession.user
    next()
  })

  return function (req, res, next) { // this can be a plugin
    req.signup = function (credentials, callback) {
      var credentialStatus = validateCredentials(credentials)
      if (credentialStatus.errors) {
        return callback(credentialStatus.errors)
      }
      if (req.event) {
        req.event.target.submit()
      }
    }
    req.login = function (credentials, callback) {
      if (req.event) {
        req.event.target.submit()
      }
    }
    req.logout = function (callback) {
      window.location = req.path
    }
    next()
  }
}
