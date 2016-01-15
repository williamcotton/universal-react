var React = require('react')

var FrontPage = require('./front-page.jsx')
var About = require('./about.jsx')
var Calculator = require('./calculator.jsx')
var Signup = require('./signup.jsx')
var Welcome = require('./welcome.jsx')
var Login = require('./login.jsx')

var universalApp = function (options) {
  var app = options.app

  // no user login required
  app.get('/', function (req, res) {
    var content = <FrontPage />
    res.renderApp(content)
  })

  app.get('/about', function (req, res) {
    var content = <About />
    res.renderApp(content, {title: 'About'})
  })

  app.get('/calculator', function (req, res) {
    var content = <Calculator />
    res.renderApp(content, {title: 'Calculator'})
  })

  app.post('/calculator', function (req, res) {
    var firstNumber = parseFloat(req.body.firstNumber)
    var secondNumber = parseFloat(req.body.secondNumber)
    var operation = req.body.operation
    var result
    switch (operation) {
      case '+':
        result = firstNumber + secondNumber
        break
      case '-':
        result = firstNumber - secondNumber
        break
    }
    var content = <Calculator result={result} firstNumber={firstNumber} secondNumber={secondNumber} operation={operation} />
    res.renderApp(content, {title: 'Calculator'})
  })

  // expect-universal-user-authentication
  require('../js/lib/expect-universal-user-authentication')({
    app: app,
    login: { component: Login, path: '/login', successRedirect: '/' },
    signup: { component: Signup, path: '/signup', successRedirect: '/welcome' },
    logout: { path: '/logout', successRedirect: '/' }
  })

  var userRequired = function (req, res, next) {
    if (!req.user) {
      var content = <h2>Login Required!</h2>
      return res.renderApp(content, {title: 'Login Required'})
    }
    next()
  }

  app.get('/welcome', userRequired, function (req, res) {
    var content = <Welcome />
    res.renderApp(content, {title: 'Welcome'})
  })

  return app
}

module.exports = universalApp
