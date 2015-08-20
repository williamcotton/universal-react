var test = require('tapes');
var jsdom = require('jsdom');
var async = require('async');
var request = require('request');

var routesMap = require('../../json/routes-map.json');

if (!global.document) {
  global.document = jsdom.jsdom('<!doctype html><html><body><div id="universal-app-container"></div></body></html>');
  global.window = global.document.parentWindow;
  global.navigator = {
    userAgent: 'node.js'
  };
}

// prouter needs these globals
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
  localStorage: localStorage,
  request: request
});

browserApp.listen();

test('browserApp', function (t) {

  t.test('should create the App component', function (t) {
    var appContainer = global.document.getElementsByClassName("app-container")[0].innerHTML;
    t.ok(appContainer, "created App DOM element");
    t.end();
  });

  t.test('browser should load all the routes specified in the routes map', function (t) {
    var routes = Object.keys(routesMap);
    t.plan(routes.length);
    async.each(routes, function(route, callback) {
      var className = routesMap[route];
      browserApp.navigate(route);
      var element = global.document.querySelector("." + className);
      var container = element ? element.innerHTML : false;
      t.ok(container, route + " has " + className);
      callback();
    });    
  });

  t.end();

});