module.exports = function (options) {
  var React = require('react')
  var ReactDOMServer = require('react-dom/server')
  var ejs = require('ejs')
  var template = options.template
  var contentProps = options.contentProps || {}
  var RootComponent = React.createFactory(options.RootComponent)
  var formatTitle = options.formatTitle || function (defaultTitle, title) { return defaultTitle + (title ? ' - ' + title : '') }
  return function (req, res, next) {
    var navigate = function (pathname) {
      res.redirect(pathname)
    }
    res.renderApp = function (content, opts) {
      var title = formatTitle(options.defaultTitle, opts ? opts.title : false)
      contentProps.navigate = navigate
      var contentWithProps = React.cloneElement(content, contentProps)
      var HTML = ReactDOMServer.renderToStaticMarkup(RootComponent({
        content: contentWithProps,
        opts: opts
      }))
      var renderedTemplate = ejs.render(template, { HTML: HTML, title: title, rootDOMId: options.rootDOMId, browserEnv: options.browserEnv }, {})
      res.send(renderedTemplate)
    }
    next()
  }
}
