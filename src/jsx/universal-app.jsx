var React = require("react");

var FrontPage = require('./front-page.jsx');
var Login = require('./login.jsx');
var Images = require('./images.jsx');

var universalApp = function(options) {

  var app = options.app;

  var imageSearch = options.imageSearch;

  app.get('/', function(req, res) {
    var content = <FrontPage />;
    res.renderApp(content);
  });

  app.get('/login', function(req, res) {
    var content = <Login />;
    res.renderApp(content, {title: "Login"});
  });

  app.get('/images', function(req, res) {
    var content = <Images />;
    res.renderApp(content, {title: "Images"});
  });

  app.get('/images/:searchTerm', function(req, res) {
    var searchTerm = req.params.searchTerm;
    imageSearch(searchTerm, function(err, images) {
      var content = <Images images={images} searchTerm={searchTerm} />;
      res.renderApp(content, {title: "Images - " + searchTerm});
    });
  });

  return app;

}

module.exports = universalApp;