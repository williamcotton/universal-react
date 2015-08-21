var test = require('tapes');
var jsdom = require('jsdom');
var request = require('request');

var universalAppSpec = require('../universal-app-spec');

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

var defaultTitle = "Test";

var browserApp = require("../../../src/js/browser/app.js")({
  document: global.document,
  window: global.window,
  browserEnv: {
    nodeEnv: "test",
    defaultTitle: defaultTitle
  },
  localStorage: localStorage,
  request: request
});

browserApp.listen();

jsdom.jQueryify(global.window, "http://code.jquery.com/jquery-2.1.1.js", function () {

  test('browserApp', function (t) {

    var domRoute = function(route, callback) {
      browserApp.navigate(route);
      callback(global.window.$);
    }

    universalAppSpec(t, domRoute, defaultTitle);

    t.end();

  });

});

