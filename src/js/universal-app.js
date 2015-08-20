var React = require("react");

var FrontPage = React.createFactory(require('../jsx/front-page.jsx'));
var Login = React.createFactory(require('../jsx/login.jsx'));
var Images = React.createFactory(require('../jsx/images.jsx'));

var universalApp = function(options) {

  var renderApp = options.renderApp;
  var app = options.app;

  var imageSearch = options.imageSearch;

  app.get('/', function(req, res) {
    var content = FrontPage();
    renderApp(content, req, res);
  });

  app.get('/login', function(req, res) {
    var content = Login();
    renderApp(content, req, res, {title: "Login"});
  });

  app.get('/images', function(req, res) {
    var content = Images();
    renderApp(content, req, res, {title: "Images"});
  });

  app.get('/images/:searchTerm', function(req, res) {
    var searchTerm = req.params.searchTerm;
    imageSearch(searchTerm, function(err, images) {
      var content = Images({images: images, searchTerm: searchTerm});
      renderApp(content, req, res, {title: "Images - " + searchTerm});
    });
  });

  return app;

}

module.exports = universalApp;