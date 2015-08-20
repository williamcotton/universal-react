var test = require('tapes');
var jsdom = require('jsdom');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

var nodeEnv = "test";
var defaultTitle = "test title";
var port = 12345;
var baseUrl = 'http://localhost:' + port;

var routesMap = require('../../json/routes-map.json');

if (!global.document) {
  global.document = jsdom.jsdom('<!doctype html><html><body><div id="universal-app-container"></div></body></html>');
  global.window = global.document.parentWindow;
  global.navigator = {
    userAgent: 'node.js'
  };
}

test('serverApp', function (t) {

  var serverApp;

  t.beforeEach(function(t) {
    serverApp = require("../../../src/js/server/app")({
      defaultTitle: defaultTitle,
      nodeEnv: nodeEnv,
      port: port
    });
    serverApp.listen(port, function() {
      t.end();
    })
  });

  t.afterEach(function(t) {
    serverApp.close();
    t.end();
  });

  t.test('should have the defaultTitle', function (t) {
    t.plan(1);
    request(baseUrl, function(err, res, body) {
      var $ = cheerio.load(body, {xmlMode: true});
      var title = $('title').html();
      t.equal(title, defaultTitle, "created proper title");
    });
  });

  t.test('should load all the routes specified in the routes map', function (t) {
    var routes = Object.keys(routesMap);
    t.plan(routes.length);
    async.each(routes, function(route, callback) {
      var className = routesMap[route];
      request(baseUrl + route, function(err, res, body) {
        var $ = cheerio.load(body, {xmlMode: true});
        var container = $('.' + className).html();
        t.ok(container, route + " has " + className);
        callback();
      });
    });    
  });

  t.end();

});