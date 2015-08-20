var test = require('tapes');
var jsdom = require('jsdom');

var cookie = require("cookie");

if (!global.document) {
  global.document = jsdom.jsdom('<!doctype html><html><body><div id="universal-app-container"></div></body></html>');
  global.window = global.document.parentWindow;
  global.navigator = {
    userAgent: 'node.js'
  };
}

var localStorage = require('localStorage');

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
require('node-jsx').install({extension: '.jsx'});

var browserSession = require('../../../src/js/browser/session')({
  localStorage: localStorage,
  document: global.document
});

test('browser session', function (t) {

  browserSession.removeAll();

  t.test('should set and get', function (t) {
    var key = "key";
    var val = "val";
    browserSession.set(key, val);
    t.equal(browserSession.get(key), val, "got when was set");
    t.end();
  });

  t.test('should set and update cookie', function (t) {
    var key = "key";
    var val = "val";
    browserSession.set(key, val);
    var cookieObject = cookie.parse(global.document.cookie);
    var session = JSON.parse(cookieObject.session);
    t.equal(session[key], val, "got session from cookie");
    t.end();
  });

  t.test('should set and remove', function (t) {
    var key = "key";
    var val = "val";
    browserSession.set(key, val);
    browserSession.remove(key);
    t.notOk(browserSession.get(key), "didn't get when removed");
    t.end();
  });

  t.test('should set a couple and remove them all', function (t) {
    var key1 = "key1";
    var key2 = "key2";
    var val = "val";
    browserSession.set(key1, val);
    browserSession.set(key2, val);
    browserSession.removeAll();
    t.notOk(browserSession.get(key1), "didn't get key1 when removed all");
    t.notOk(browserSession.get(key2), "didn't get key2 when removed all");
    t.end();
  });


  t.end();

});