module.exports = function (options) {
  var React = require('react')
  var ReactDOMServer = require('react-dom/server')
  var ejs = require('ejs')

  var template = options.template

  var browserEnv = options.browserEnv

  var defaultTitle = browserEnv.defaultTitle
  var RootComponent = React.createFactory(options.RootComponent)

  var formatTitle = options.formatTitle || function (defaultTitle, title) { return defaultTitle + (title ? ' - ' + title : '') }

  return function (req, res, next) {
    res.renderApp = function (content, opts) {
      var title = formatTitle(defaultTitle, opts ? opts.title : false)
      var HTML = ReactDOMServer.renderToStaticMarkup(RootComponent({
        content: content,
        opts: opts,
        browserEnv: browserEnv,
        session: req.session
      }))
      // should it use react to render instead of ejs?
      // https://gist.github.com/williamcotton/48a42b58e413804343a2
      var renderedTemplate = ejs.render(template, { HTML: HTML, title: title, browserEnv: browserEnv }, {})
      res.send(renderedTemplate)
    }
    next()
  }

}
