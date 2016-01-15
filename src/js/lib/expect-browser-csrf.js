module.exports = function (options) {
  return function (req, res, contentProps, rootProps, next) {
    contentProps.csrf = req.csrf
    next()
  }
}
