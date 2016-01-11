var async = require('async')

var middlewareStack = []

var reactRenderApp = function (options) {
  var React = require('react')
  var ReactDOMServer = require('react-dom/server')
  var ejs = require('ejs')
  var template = options.template
  var contentProps = {}
  var browserEnv = options.browserEnv || {}
  var rootProps = {}
  var RootComponent = options.RootComponent ? React.createFactory(options.RootComponent) : React.createClass({propTypes: { content: React.PropTypes.element }, render: function () { return React.DOM.div({ className: 'universal-app-container' }, this.props.content) }})
  var formatTitle = options.formatTitle || function (defaultTitle, title) { return defaultTitle + (title ? ' - ' + title : '') }
  return function (req, res, next) {
    var navigate = function (pathname) {
      res.redirect(pathname)
    }
    res.renderApp = function (content, opts) {
      var title = formatTitle(options.defaultTitle, opts ? opts.title : false)
      contentProps.navigate = navigate
      async.each(middlewareStack, function (middlewareFunction, callback) {
        middlewareFunction(req, res, contentProps, rootProps, browserEnv, callback)
      }, function () {
        var contentWithProps = React.cloneElement(content, contentProps)
        rootProps.content = contentWithProps
        rootProps.opts = opts
        var HTML = ReactDOMServer.renderToStaticMarkup(RootComponent(rootProps))
        // if template was optional, or dynamic... a module could pass in the template...
        var renderedTemplate = ejs.render(template, { HTML: HTML, title: title, rootDOMId: options.rootDOMId, browserEnv: browserEnv }, {})
        res.send(renderedTemplate)
      })
    }
    next()
  }
}

reactRenderApp.use = function (middlewareFunction) {
  middlewareStack.push(middlewareFunction)
}

module.exports = reactRenderApp
