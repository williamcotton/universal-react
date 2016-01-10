module.exports = function (options) {
  var React = require('react')
  var ReactDOM = require('react-dom')
  var RootComponent = React.createFactory(options.RootComponent)
  var app = options.app
  var formatTitle = options.formatTitle || function (defaultTitle, title) { return defaultTitle + (title ? ' - ' + title : '') }
  var contentProps = options.contentProps || {}
  var rootProps = options.rootProps || {}
  contentProps.navigate = app.navigate
  return function (req, res, next) {
    res.renderApp = function (content, opts) {
      options.document.title = formatTitle(options.defaultTitle, opts ? opts.title : false)
      var contentWithProps = React.cloneElement(content, contentProps)
      rootProps.content = contentWithProps
      rootProps.opts = opts
      ReactDOM.render(RootComponent(rootProps), options.document.getElementById(options.rootDOMId))
    }
    next()
  }
}
