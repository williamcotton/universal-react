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

  var _csrf

  expectReactRenderer.use(function (req, res, contentProps, rootProps, browserEnv, serverSession, next) { // this can be a plugin
    contentProps.user = serverSession.user
    rootProps.user = serverSession.user
    _csrf = serverSession.csrf
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
      } else {
        var signupForm = document.createElement('form')
        signupForm.action = req.path
        signupForm.method = 'post'

        var email = document.createElement('input')
        email.name = 'email'
        email.value = credentials.uuid

        var password = document.createElement('input')
        password.name = 'password'
        password.value = credentials.password

        var repeat_password = document.createElement('input')
        repeat_password.name = 'repeat_password'
        repeat_password.value = credentials.repeatPassword

        var csrf = document.createElement('input')
        csrf.name = '_csrf'
        csrf.value = _csrf

        signupForm.appendChild(email)
        signupForm.appendChild(password)
        signupForm.appendChild(repeat_password)
        signupForm.appendChild(csrf)

        signupForm.submit()
      }
    }
    req.login = function (credentials, callback) {
      if (req.event) {
        req.event.target.submit()
      } else {
        var loginForm = document.createElement('form')
        loginForm.action = req.path
        loginForm.method = 'post'

        var email = document.createElement('input')
        email.name = 'email'
        email.value = credentials.uuid

        var password = document.createElement('input')
        password.name = 'password'
        password.value = credentials.password

        var csrf = document.createElement('input')
        csrf.name = '_csrf'
        csrf.value = _csrf

        loginForm.appendChild(email)
        loginForm.appendChild(password)
        loginForm.appendChild(csrf)

        loginForm.submit()
      }

    }
    req.logout = function (callback) {
      window.location = req.path
    }
    next()
  }
}
