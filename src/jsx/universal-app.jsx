var React = require('react')

var FrontPage = require('./front-page.jsx')

var universalApp = (options) => {
  var app = options.app

  app.get('/', (req, res) => {
    var content = <FrontPage />
    res.renderApp(content)
  })

  return app
}

module.exports = universalApp
