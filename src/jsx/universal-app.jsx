var React = require('react')

var FrontPage = require('./front-page.jsx')
var About = require('./about.jsx')
var Calculator = require('./calculator.jsx')
var Login = require('./login.jsx')
var LoginSuccess = require('./login-success.jsx')

var universalApp = function (options) {
  var app = options.app

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

  app.get('/login', function (req, res) {
    var content = <Login />
    res.renderApp(content, {title: 'Login'})
  })

  app.post('/login', function (req, res) {
    var username = req.body.username
    var password = req.body.password
    req.login(username, password, function (err) {
      var content
      var title
      if (!err) {
        content = <LoginSuccess />
        title = 'Login Success'
      } else {
        content = <Login loggedIn={false} username={username} />
        title = 'Login Failure'
      }
      res.renderApp(content, {title: title})
    })
  })

  app.get('/logout', function (req, res) {
    req.logout(function () {
      res.redirect('/')
    })
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

  return app
}

module.exports = universalApp
