// this should create a <Form /> react component that is pre-populated with the CSRF
module.exports = function (options) {
  return function (req, res, contentProps, rootProps, next) {
    contentProps.csrf = req.csrf
    next()
  }
}
