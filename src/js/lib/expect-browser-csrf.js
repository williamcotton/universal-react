module.exports = function (options) {
  return function (req, res, contentProps, rootProps, browserEnv, serverSession, next) {
    contentProps.csrf = serverSession.csrf
    next()
  }
}
