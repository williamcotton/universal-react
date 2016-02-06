var async = require('async')
var React = require('react')
var ReactDOM = require('react-dom')

var middlewareStack = []

var reactRenderApp = function (options) {
  var RootComponent = options.RootComponent ? React.createFactory(options.RootComponent) : React.createClass({propTypes: { content: React.PropTypes.element }, render: function () { return React.DOM.div({ className: 'universal-app-container' }, this.props.content) }})
  var app = options.app
  var formatTitle = options.formatTitle || function (defaultTitle, title) { return defaultTitle + (title ? ' - ' + title : '') }
  return function (req, res, next) {
    res.redirect = app.navigate
    res.send = function (data) {
      if (typeof data === 'object') {
        data = JSON.stringify(data)
      }
      options.document.getElementById(options.rootDOMId).innerHTML = data
    }
    res.renderApp = function (content, opts) {
      var rootProps = {}
      var contentProps = {}
      rootProps.navigate = app.navigate
      contentProps.navigate = app.navigate
      rootProps.submit = app.submit
      contentProps.submit = app.submit
      options.document.title = formatTitle(req.defaultTitle, opts ? opts.title : false)
      async.each(middlewareStack, function (middlewareFunction, callback) {
        middlewareFunction(req, res, contentProps, rootProps, callback)
      }, function () {
        contentProps.Form = require('../../jsx/lib/form.jsx')(req, res, rootProps, contentProps)
        var contentWithProps
        if (typeof content.type === 'string') {
          contentWithProps = content
        } else {
          contentWithProps = React.cloneElement(content, contentProps)
        }
        rootProps.content = contentWithProps
        rootProps.opts = opts
        ReactDOM.render(RootComponent(rootProps), options.document.getElementById(options.rootDOMId), function () {
          if (res.onComplete) {
            res.onComplete()
          }
        })
      })
    }
    next()
  }
}

reactRenderApp.use = function (middlewareFunction) {
  middlewareStack.push(middlewareFunction)
}

module.exports = reactRenderApp
