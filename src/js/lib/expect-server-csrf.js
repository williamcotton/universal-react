module.exports = function (options) {
  var app = options.app

  var csrfExternal

  app.getCsrf = function () {
    return csrfExternal
  }

  return function (req, res, contentProps, rootProps, outgoingMessage, next) {
    var csrf = req.csrfToken()
    contentProps.csrf = csrf
    outgoingMessage.csrf = csrf
    csrfExternal = csrf
    next()
  }
}
