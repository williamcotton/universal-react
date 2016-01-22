var React = require('react')

module.exports = function (options) {
  var app = options.app

  var signup = options.signup || {}
  var login = options.login || {}
  var logout = options.logout || {}
  var newPassword = options.newPassword || {}
  var resetPassword = options.resetPassword || {}

  var signupComponent = React.createFactory(signup.component)
  var loginComponent = React.createFactory(login.component)
  var resetPasswordComponent = React.createFactory(resetPassword.component)
  var newPasswordComponent = React.createFactory(newPassword.component)
  var resetPasswordSuccessComponent = React.createFactory(resetPassword.successComponent)

  var signupPath = signup.path || '/signup'
  var loginPath = login.path || '/login'
  var logoutPath = logout.path || '/logout'
  var resetPasswordPath = resetPassword.path || '/reset-password'
  var newPasswordPath = newPassword.path || '/new-password'

  var signupSuccessRedirect = signup.successRedirect || '/'
  var loginSuccessRedirect = login.successRedirect || '/'
  var logoutSuccessRedirect = logout.successRedirect || '/'
  var resetPasswordSuccessRedirect = resetPassword.successRedirect || '/reset-password-email-sent'
  var newPasswordSuccessRedirect = newPassword.successRedirect || '/login'

  var signupTitle = signup.title || 'Signup'
  var loginTitle = login.title || 'Login'
  var resetPasswordTitle = resetPassword.title || 'Reset Password'
  var newPasswordTitle = newPassword.title || 'New Password'

  var signupRequestFunction = signup.requestFunction || 'signup'
  var loginRequestFunction = login.requestFunction || 'login'
  var logoutRequestFunction = logout.requestFunction || 'logout'
  var resetPasswordRequestFunction = resetPassword.requestFunction || 'sendResetPasswordEmail'
  var newPasswordRequestFunction = resetPassword.requestFunction || 'updatePassword'

  app.get(signupPath, function (req, res) {
    var content = signupComponent({formAction: signupPath})
    res.renderApp(content, {title: signupTitle})
  })

  app.post(signupPath, function (req, res) {
    var credentials = {
      type: req.body.type,
      uuid: req.body.uuid,
      password: req.body.password,
      repeatPassword: req.body.repeatPassword
    }
    req[signupRequestFunction](credentials, function (credentialErrors) {
      var content
      var title = signupTitle
      if (!credentialErrors) {
        return res.redirect(signupSuccessRedirect)
      } else {
        content = signupComponent({formAction: signupPath, errors: credentialErrors, uuid: credentials.uuid, password: credentials.password})
        title += ' - Errors'
      }
      res.renderApp(content, {title: title})
    })
  })

  app.get(loginPath, function (req, res) {
    var uuid = req.query.uuid
    var updatePasswordSuccess = req.query['update-password-success']
    var content = loginComponent({formAction: loginPath, uuid: uuid, updatePasswordSuccess: updatePasswordSuccess})
    res.renderApp(content, {title: loginTitle})
  })

  app.post(loginPath, function (req, res) {
    var credentials = {
      type: req.body.type,
      uuid: req.body.uuid,
      password: req.body.password
    }
    req[loginRequestFunction](credentials, function (err) {
      var content
      var title = loginTitle
      if (!err) {
        return res.redirect(loginSuccessRedirect)
      } else {
        content = loginComponent({formAction: loginPath, error: err, uuid: credentials.uuid})
        title += ' - Errors'
      }
      res.renderApp(content, {title: title})
    })
  })

  app.get(logoutPath, function (req, res) {
    req[logoutRequestFunction](function () {
      res.redirect(logoutSuccessRedirect)
    })
  })

  app.get(resetPasswordPath, function (req, res) {
    var expired = req.query.expired
    var content = resetPasswordComponent({formAction: resetPasswordPath, expired: expired})
    res.renderApp(content, {title: resetPasswordTitle})
  })

  app.post(resetPasswordPath, function (req, res) {
    var credentials = {
      type: req.body.type,
      uuid: req.body.uuid
    }
    req[resetPasswordRequestFunction](credentials, function (err, emailReceipt) {
      var content
      var title = resetPasswordTitle
      if (!err) {
        return res.redirect(resetPasswordSuccessRedirect)
      } else {
        content = resetPasswordComponent({formAction: resetPasswordPath})
        title += ' - Errors'
      }
      res.renderApp(content, {title: title})
    })
  })

  app.get(newPasswordPath, function (req, res) {
    var token = req.query.token
    req.checkResetPasswordToken({token: token}, function (err, credentials) {
      if (!credentials) {
        return res.redirect(loginPath)
      }
      credentials.token = token
      var content = newPasswordComponent({credentials: credentials, formAction: newPasswordPath})
      res.renderApp(content, {title: newPasswordTitle})
    })
  })

  app.post(newPasswordPath, function (req, res) {
    var checkCredentials = {
      uuid: req.body.uuid,
      token: req.body.token,
      password: req.body.password,
      repeatPassword: req.body.repeatPassword
    }
    req[newPasswordRequestFunction](checkCredentials, function (credentialErrors, credentials) {
      var content
      var title = newPasswordTitle
      if (!credentialErrors) {
        return res.redirect(newPasswordSuccessRedirect + '?uuid=' + credentials.uuid + '&update-password-success=true')
      } else {
        content = newPasswordComponent({formAction: newPasswordPath, errors: credentialErrors, credentials: checkCredentials})
        title += ' - Errors'
      }
      res.renderApp(content, {title: title})
    })
  })

  app.get(resetPasswordSuccessRedirect, function (req, res) {
    var content = resetPasswordSuccessComponent({})
    res.renderApp(content, {title: resetPasswordTitle})
  })
}
