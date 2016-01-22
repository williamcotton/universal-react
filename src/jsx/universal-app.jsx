var React = require('react')

var FrontPage = require('./front-page.jsx')
var About = require('./about.jsx')
var Calculator = require('./calculator.jsx')
var Signup = require('./signup.jsx')
var Welcome = require('./welcome.jsx')
var Login = require('./login.jsx')
var ResetPassword = require('./reset-password.jsx')
var NewPassword = require('./new-password.jsx')
var ResetPasswordEmailSent = require('./reset-password-email-sent.jsx')
var ShowCollection = require('./lib/show-collection.jsx')
var ShowItem = require('./lib/show-item.jsx')
var EditItem = require('./lib/edit-item.jsx')
var NewItem = require('./lib/new-item.jsx')

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

  require('../js/lib/expect-universal-user-authentication')({
    app: app,
    login: { component: Login, successRedirect: '/welcome' },
    signup: { component: Signup, successRedirect: '/welcome' },
    logout: { successRedirect: '/' },
    resetPassword: { component: ResetPassword, successComponent: ResetPasswordEmailSent },
    newPassword: { component: NewPassword }
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

  var songCreateCells = {
    stars: function (item, col) {
      var getStarsGlyph = function (numberOfStars) {
        numberOfStars = parseInt(numberOfStars, 10)
        var x = function (c, t) { return Array(t + 1).join(c) }
        return x('★', numberOfStars) + x('☆', 5 - numberOfStars)
      }
      var numberOfStars = item[col]
      return getStarsGlyph(numberOfStars)
    }
  }

  app.get('/songs', function (req, res) {
    req.songs.findAll(function (songs) {
      var title = 'All Songs'
      var content = <ShowCollection collection={songs} title={title} createCells={songCreateCells} baseUrl='/songs' />
      res.renderApp(content, {title: title})
    })
  })

  app.get('/songs/new', userRequired, function (req, res) {
    req.songs.template(function (songTemplate) {
      var title = 'New Song'
      var content = <NewItem itemTemplate={songTemplate} title={title} createCells={songCreateCells} baseUrl='/songs'/>
      res.renderApp(content, {title: title})
    })
  })

  app.post('/songs/create', userRequired, function (req, res) {
    req.songs.create(req.body, function (song) {
      var title = 'Created ' + song.name
      var content = <ShowItem item={song} title={title} createCells={songCreateCells} />
      res.renderApp(content, {title: title})
    })
  })

  app.get('/songs/:id', function (req, res) {
    req.songs.find({id: req.params.id}, function (song) {
      var title = song.name
      var content = <ShowItem item={song} title={title} createCells={songCreateCells} />
      res.renderApp(content, {title: title})
    })
  })

  app.get('/songs/:id/edit', userRequired, function (req, res) {
    req.songs.find({id: req.params.id}, function (song) {
      var title = 'Editing ' + song.name
      var content = <EditItem item={song} title={title} createCells={songCreateCells} baseUrl='/songs'/>
      res.renderApp(content, {title: title})
    })
  })

  app.post('/songs/:id', userRequired, function (req, res) {
    req.songs.update({id: req.params.id}, req.body, function (song) {
      var title = 'Updated ' + song.name
      var content = <ShowItem item={song} title={title} createCells={songCreateCells} />
      res.renderApp(content, {title: title})
    })
  })

  app.post('/songs/:id/delete', userRequired, function (req, res) {
    req.songs.delete({id: req.params.id}, req.body, function (song) {
      var title = 'Removed ' + song.name
      //var content = <RemovedItem item={song} title={title} createCells={songCreateCells} />
      //res.renderApp(content, {title: title})
    })
  })

  return app
}

module.exports = universalApp
