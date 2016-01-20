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
  var request = options.request
  var localStorage = options.localStorage
  var app = options.app

  // expect-browser-localstorage-session
  app.use(require('../lib/expect-browser-localstorage-session')({
    localStorage: localStorage
  }))

  // expect-browser-csrf
  expectReactRenderer.use(require('../lib/expect-browser-csrf')())

  expectReactRenderer.use(function (req, res, contentProps, rootProps, next) {
    var user = req.user
    contentProps.user = user
    rootProps.user = user
    next()
  })

  return function (req, res, next) { // this can be a plugin
    req.signup = function (credentials, callback) {
      var credentialStatus = validateCredentials(credentials)
      if (credentialStatus.errors) {
        return callback(credentialStatus.errors, false)
      }
      request({method: 'post', url: req.path + '.json', json: req.body, headers: {'x-csrf-token': req.csrf}}, function (err, res, body) {
        var errors
        if (err || !res || !res.body) {
          errors = [err]
          return callback(errors, false)
        }
        if (res.statusCode >= 500) {
          errors = [res.body]
          return callback(errors, false)
        }
        var user = res.body
        req.user = user
        req.session.user = user
        callback(err, user)
      })
    }
    req.login = function (credentials, callback) {
      request({method: 'post', url: req.path + '.json', json: req.body, headers: {'x-csrf-token': req.csrf}}, function (err, res, body) {
        if (err || !res || !res.body) {
          var errors = [err]
          return callback(errors, false)
        }
        var user = res.body
        req.user = user
        req.session.user = user
        callback(err, user)
      })
    }
    req.logout = function (callback) {
      delete req.user
      delete req.session.user
      res.loadPage(req.path)
    }
    if (req.session && req.session.user) {
      req.user = req.session.user
    }
    next()
  }
}
