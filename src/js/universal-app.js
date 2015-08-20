var React = require("react");

var FrontPage = React.createFactory(require('../jsx/front-page.jsx'));
var Login = React.createFactory(require('../jsx/login.jsx'));

var universalApp = function(options) {

  var renderApp = options.renderApp;
  var app = options.app;

  app.get('/', function(req, res) {
    var content = FrontPage();
    renderApp(content, req, res);
  });

  app.get('/login', function(req, res) {
    var content = Login();
    renderApp(content, req, res, {title: "Login"});
  });

  return app;

}

module.exports = universalApp;