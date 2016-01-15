var React = require('react')

module.exports = function (options) {
  var app = options.app

  var signup = options.signup || {}
  var login = options.login || {}
  var logout = options.logout || {}

  var signupComponent = React.createFactory(signup.component)
  var loginComponent = React.createFactory(login.component)

  var signupPath = signup.path || '/signup'
  var loginPath = login.path || '/login'
  var logoutPath = logout.path || '/logout'

  var signupSuccessRedirect = signup.successRedirect || '/'
  var loginSuccessRedirect = login.successRedirect || '/'
  var logoutSuccessRedirect = logout.successRedirect || '/'

  var signupTitle = signup.title || 'Signup'
  var loginTitle = login.title || 'Login'

  var signupRequestFunction = signup.requestFunction || 'signup'
  var loginRequestFunction = login.requestFunction || 'login'
  var logoutRequestFunction = logout.requestFunction || 'logout'

  app.get(signupPath, function (req, res) {
    var content = signupComponent({formAction: signupPath})
    res.renderApp(content, {title: signupTitle})
  })

  app.post(signupPath, function (req, res) {
    var credentials = {
      type: req.body.type,
      uuid: req.body.uuid,
      password: req.body.password,
      repeatPassword: req.body.repeat_password
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
    var content = loginComponent({formAction: loginPath})
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
        content = loginComponent({formAction: loginPath, loggedIn: false, uuid: credentials.uuid})
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
}
