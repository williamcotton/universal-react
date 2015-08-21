var test = require('tapes');
var jsdom = require('jsdom');
var request = require('request');
var cheerio = require('cheerio');

var nodeEnv = "test";
var defaultTitle = "Test";
var port = 12345;
var baseUrl = 'http://localhost:' + port;

var universalAppSpec = require('../universal-app-spec');

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

  var domRoute = function(route, callback) {
    request(baseUrl + route, function(err, res, body) {
      var $ = cheerio.load(body, {xmlMode: true});
      callback($);
    });
  };

  universalAppSpec(t, domRoute, defaultTitle);

  t.end();

});