module.exports = function(t, domRoute, defaultTitle) {

  var React = require('react/addons');
  var TestUtils = React.addons.TestUtils;

  var async = require('async');

  var Router = require('router');
  var router = new Router();
  
  var mockImageSearch = function(searchTerm, callback) {
    callback(false, []);
  }

  var routesMap = {};
  
  var mockApp = {
    get: function(route, handler) {
      router.get(route, function(req, res) {
        handler(req, res);
      });
      var req = {
        url: route,
        method: "GET"
      };
      var res = {
        renderApp: function(content, opts) {
          var shallowRenderer = TestUtils.createRenderer();
          shallowRenderer.render(content);
          var renderedOutput = shallowRenderer.getRenderOutput();
          routesMap[route] = renderedOutput.props.className;
          // routesMap['/login'] = 'login-container';
        }
      }
      router.handle(req, res, function() {});
    },
  };

  var universalTestApp = require('../../src/jsx/universal-app.jsx')({
    app: mockApp,
    imageSearch: mockImageSearch
  });

  t.test('should create the App component', function (t) {
    t.plan(1);
    domRoute("/", function($) {
      var container = $('.app-container').html();
      t.ok(container, "created App component");
    });
  });

  t.test('should have the defaultTitle', function (t) {
    t.plan(1);
    domRoute("/", function($) {
      var title = $('title').html();
      t.equal(title, defaultTitle, "created proper title");
    });
  });

  t.test('should load all the routes specified in the routes map and find the expected DOM elements', function (t) {
    var routes = Object.keys(routesMap);
    t.plan(routes.length);
    async.each(routes, function(route, callback) {
      var className = routesMap[route];
      domRoute(route, function($) {
        var container = $('.' + className).html();
        t.ok(container, route + " has " + className);
        callback();
      });
    });    
  });

};