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
  var verificationSuccessPath = options.verificationSuccessPath
  var newPasswordPath = options.newPasswordPath
  var expiredResetPasswordTokenPath = options.expiredResetPasswordTokenPath || '/reset-password'
  var expectReactRenderer = options.expectReactRenderer
  var app = options.app

    // cookie-session
  var cookieSession = require('cookie-session')
  app.use(cookieSession({
    keys: ['SECRET']
  }))

  // body-parser
  var bodyParser = require('body-parser')
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  // api-user-authentication, consumes userAuthenticationService,
  // rate limiting
  // cors
  // uses audience 'expect-api-session-user' and/or 'expect-cors-session-user'
  // so electron can login, so cors can login

  // csurf
  var csrf = require('csurf')
  app.use(csrf())

  // api-user-authentication csrf override
  app.use(function (err, req, res, next) {
    if (err.code === 'EBADCSRFTOKEN' && req.user) {
      return next()
    }
    next(err)
  })

  // expect-server-outgoing-message
  app.use(function expectServerOutgoingMessage (req, res, next) {
    res.outgoingMessage = {}
    res.outgoingMessage.method = req.method
    if (req.body) {
      res.outgoingMessage.body = req.body
    }
    next()
  })

  // expect-server-csrf
  expectReactRenderer.use(require('../lib/expect-server-csrf')({
    app: app
  }))

  app.get(userAuthenticationService.verificationPath, function (req, res) {
    var token = req.params.token
    userAuthenticationService.verifyVerificationUrlToken({token: token}, function (err, credentials) {
      if (credentials) {
        res.redirect(verificationSuccessPath)
      } else {
        res.redirect('/')
      }
    })
  })

  app.get(userAuthenticationService.resetPasswordPath, function (req, res) {
    var token = req.params.token
    userAuthenticationService.verifyResetPasswordUrlToken({token: token}, function (err, credentials) {
      if (credentials) {
        res.redirect(newPasswordPath + '?token=' + token)
      } else if (err === 'TOKEN_EXPIRED') {
        res.redirect(expiredResetPasswordTokenPath + '?expired=true')
      } else {
        res.redirect('/')
      }
    })
  })

  app.post('/signup.json', function (req, res) {
    authMiddleware(req, res, function () {
      var credentials = {
        type: req.body.type,
        uuid: req.body.uuid,
        password: req.body.password,
        repeatPassword: req.body.repeatPassword
      }
      req.signup(credentials, function (err, user) {
        if (err) {
          return res.status(500).send(err)
        }
        res.send(user)
      })
    })
  })

  app.post('/login.json', function (req, res) {
    authMiddleware(req, res, function () {
      var credentials = {
        type: req.body.type,
        uuid: req.body.uuid,
        password: req.body.password
      }
      req.login(credentials, function (err, user) {
        if (err) {
          return res.status(500).send(err)
        }
        res.send(user)
      })
    })
  })

  app.get('/logout.json', function (req, res) {
    authMiddleware(req, res, function () {
      req.logout(function (err, user) {
        if (err) {
          return res.status(500).send(err)
        }
        res.send(true)
      })
    })
  })

  app.post('/send-reset-password-email.json', function (req, res) {
    authMiddleware(req, res, function () {
      var uuid = req.body.uuid
      var type = req.body.type
      req.sendResetPasswordEmail({uuid: uuid, type: type}, function (err, emailReceipt) {
        if (err) {
          return res.status(500).send(err)
        }
        res.send(emailReceipt)
      })
    })
  })

  app.post('/check-reset-password-token.json', function (req, res) {
    authMiddleware(req, res, function () {
      var token = req.body.token
      req.checkResetPasswordToken({token: token}, function (err, credentials) {
        if (err) {
          return res.status(500).send(err)
        }
        res.send(credentials)
      })
    })
  })

  app.post('/update-password.json', function (req, res) {
    authMiddleware(req, res, function () {
      var token = req.body.token
      var password = req.body.password
      var repeatPassword = req.body.repeatPassword
      req.updatePassword({token: token, password: password, repeatPassword: repeatPassword}, function (err, credentials) {
        if (err) {
          return res.status(500).send(err)
        }
        res.send(credentials)
      })
    })
  })

  expectReactRenderer.use(function (req, res, contentProps, rootProps, next) { // this can be a plugin
    if (req.user) {
      var user = req.user
      contentProps.user = user
      rootProps.user = user
      res.outgoingMessage.user = user
    }
    next()
  })

  var authMiddleware = function expectServerUserAuthentication (req, res, next) { // this can be a plugin
    if (req.signup) {
      return next()
    }
    req.signup = function (credentials, callback) {
      var credentialStatus = validateCredentials(credentials)
      if (credentialStatus.errors) {
        return callback(credentialStatus.errors, false)
      }
      credentials.baseUrl = (req.connection.encrypted ? 'https://' : 'http://') + req.headers.host
      userAuthenticationService.createUser(credentials, function (err, user) {
        if (err || !user) {
          var errors = [err]
          return callback(errors, false)
        }
        req.login(credentials, callback)
      })
    }
    req.login = function (credentials, callback) {
      userAuthenticationService.getToken({credentials: credentials, audience: 'expect-server-session-user'}, function (err, user, token) {
        if (err || !token || !user) {
          return callback(err, false)
        }
        req.user = user
        req.session.userToken = token
        callback(false, user)
      })
    }
    req.sendResetPasswordEmail = function (options, callback) {
      var uuid = options.uuid
      var type = options.type
      userAuthenticationService.getCredentials({uuid: uuid, type: type}, function (err, credentials) {
        var emailAddress = credentials.uuid
        var baseUrl = (req.connection.encrypted ? 'https://' : 'http://') + req.headers.host
        userAuthenticationService.sendResetPasswordEmail({
          emailAddress: emailAddress,
          baseUrl: baseUrl
        }, function (err, emailReceipt) {
          callback(err, {
            success: true
          })
        })
      })
    }
    req.checkResetPasswordToken = function (options, callback) {
      var token = options.token
      userAuthenticationService.verifyResetPasswordUrlToken({token: token}, function (err, credentials) {
        if (err) {
          return callback([err], false)
        }
        callback(false, credentials)
      })
    }
    req.updatePassword = function (options, callback) {
      var token = options.token
      var password = options.password
      var repeatPassword = options.repeatPassword
      if (!token) {
        return callback(['NO_TOKEN'], false)
      }
      userAuthenticationService.verifyResetPasswordUrlToken({token: token}, function (err, credentials) {
        if (err) {
          return callback([err], false)
        }
        var newCredentials = {
          type: credentials.type,
          uuid: credentials.uuid,
          password: password,
          repeatPassword: repeatPassword
        }
        var credentialStatus = validateCredentials(newCredentials)
        if (credentialStatus.errors) {
          return callback(credentialStatus.errors, false)
        }
        userAuthenticationService.setNewPassword({token: token, newPassword: password}, function (err, credentials) {
          callback(err, credentials)
        })
      })
    }
    req.logout = function (callback) {
      if (!req.user || !req.session.userToken) {
        return callback(true, false)
      }
      delete req.user
      delete req.session.userToken
      callback(false)
    }
    if (req.session && req.session.userToken) {
      userAuthenticationService.refreshToken({token: req.session.userToken, audience: 'expect-server-session-user'}, function (err, user, token) {
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

  return authMiddleware
}
