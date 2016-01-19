module.exports = function (options) {
  var app = options.app

  var csrfExternal

  app.getCsrf = function () {
    return csrfExternal
  }

  return function expectServerCsrf (req, res, contentProps, rootProps, next) {
    var csrf = req.csrfToken()
    contentProps.csrf = csrf
    res.outgoingMessage.csrf = csrf
    csrfExternal = csrf
    next()
  }
}
