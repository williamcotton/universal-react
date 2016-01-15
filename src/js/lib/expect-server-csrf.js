module.exports = function (options) {
  var app = options.app

  var csrfExternal

  app.getCsrf = function () {
    return csrfExternal
  }

  return function (req, res, contentProps, rootProps, browserEnv, serverSession, next) {
    var csrf = req.csrfToken()
    contentProps.csrf = csrf
    serverSession.csrf = csrf
    csrfExternal = csrf
    next()
  }
}
