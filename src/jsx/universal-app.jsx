var React = require('react')

var FrontPage = require('./front-page.jsx')
var About = require('./about.jsx')
var Calculator = require('./calculator.jsx')
var Signup = require('./signup.jsx')
var Welcome = require('./welcome.jsx')
var Login = require('./login.jsx')
var ShowCollection = require('./show-collection.jsx')
var ShowItem = require('./show-item.jsx')
var EditItem = require('./edit-item.jsx')
var NewItem = require('./new-item.jsx')

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

  // add /signup, /login, /logout routes for user-authentication
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
      var content = <ShowCollection collection={songs} name='Songs' createCells={songCreateCells} baseUrl='/songs' />
      res.renderApp(content, {title: 'All Songs'})
    })
  })

  app.get('/songs/new', userRequired, function (req, res) {
    req.songs.template(function (songTemplate) {
      var content = <NewItem itemTemplate={songTemplate} name='Song' createCells={songCreateCells} baseUrl='/songs'/>
      res.renderApp(content, {title: 'All Songs'})
    })
  })

  app.post('/songs/create', userRequired, function (req, res) {
    req.songs.create(req.body, function (song) {
      res.redirect('/songs/' + song.id)
    })
  })

  app.get('/songs/:id', function (req, res) {
    req.songs.find({id: req.params.id}, function (song) {
      var content = <ShowItem item={song} name='Song' createCells={songCreateCells} />
      res.renderApp(content, {title: 'All Songs'})
    })
  })

  app.get('/songs/:id/edit', userRequired, function (req, res) {
    req.songs.find({id: req.params.id}, function (song) {
      var content = <EditItem item={song} name='Song' createCells={songCreateCells} baseUrl='/songs'/>
      res.renderApp(content, {title: 'All Songs'})
    })
  })

  app.post('/songs/:id', userRequired, function (req, res) {
    req.songs.update({id: req.params.id}, req.body, function (song) {
      res.redirect(req.path)
    })
  })

  return app
}

module.exports = universalApp
