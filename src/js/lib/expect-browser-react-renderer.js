var async = require('async')

var middlewareStack = []

var reactRenderApp = function (options) {
  var React = require('react')
  var ReactDOM = require('react-dom')
  var RootComponent = options.RootComponent ? React.createFactory(options.RootComponent) : React.createClass({propTypes: { content: React.PropTypes.element }, render: function () { return React.DOM.div({ className: 'universal-app-container' }, this.props.content) }})
  var app = options.app
  var browserEnv = options.browserEnv
  var serverSession = options.serverSession
  var formatTitle = options.formatTitle || function (defaultTitle, title) { return defaultTitle + (title ? ' - ' + title : '') }
  return function (req, res, next) {
    res.redirect = app.navigate
    res.renderApp = function (content, opts) {
      var rootProps = {}
      var contentProps = {}
      contentProps.navigate = app.navigate
      contentProps.browserEnv = browserEnv
      options.document.title = formatTitle(options.defaultTitle, opts ? opts.title : false)
      async.each(middlewareStack, function (middlewareFunction, callback) {
        middlewareFunction(req, res, contentProps, rootProps, browserEnv, serverSession, callback)
      }, function () {
        var contentWithProps = React.cloneElement(content, contentProps)
        rootProps.content = contentWithProps
        rootProps.opts = opts
        ReactDOM.render(RootComponent(rootProps), options.document.getElementById(options.rootDOMId))
      })
    }
    next()
  }
}

reactRenderApp.use = function (middlewareFunction) {
  middlewareStack.push(middlewareFunction)
}

module.exports = reactRenderApp
