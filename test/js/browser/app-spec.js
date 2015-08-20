var test = require('tapes');
var jsdom = require('jsdom');
var async = require('async');

var routesMap = require('../../json/routes-map.json');

if (!global.document) {
  global.document = jsdom.jsdom('<!doctype html><html><body><div id="universal-app-container"></div></body></html>');
  global.window = global.document.parentWindow;
  global.navigator = {
    userAgent: 'node.js'
  };
}

global.addEventListener = global.window.addEventListener;
global.location = global.window.location;
global.history = global.window.history;

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
require('node-jsx').install({extension: '.jsx'});

var localStorage = require('localStorage');

var browserApp = require("../../../src/js/browser/app.js")({
  document: global.document,
  window: global.window,
  browserEnv: {
    nodeEnv: "test"
  },
  localStorage: localStorage
});

browserApp.listen();

var setLocation = function(location) {
  global.window.location.href = location;
  global.window.history.pushState({},"", global.window.location.href);
  var event = new global.document.createEvent('Event');
  event.initEvent('popstate', true, true);
  global.window.dispatchEvent(event);
};


test('browserApp', function (t) {

  t.test('should create the App component', function (t) {
    var appContainer = global.document.getElementsByClassName("app-container")[0].innerHTML;
    t.ok(appContainer, "created App DOM element");
    t.end();
  });

  t.test('should load all the routes specified in the routes map', function (t) {
    var routes = Object.keys(routesMap);
    t.plan(routes.length);
    async.each(routes, function(route, callback) {
      var className = routesMap[route];
      setLocation(route);
      var container = global.document.getElementsByClassName(className)[0].innerHTML;
      t.ok(container, route + " has " + className);
      callback();
    });    
  });

  t.end();

});