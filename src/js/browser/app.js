module.exports = function(options) {

  var browserEnv = options.browserEnv;
  var request = options.request;

  /*

    app
    ---
    browser version

  */

  var React = require('react');
  var App = require('../../jsx/app.jsx');

  var express = require('browser-express');
  var app = express({
    interceptLinks: true,
    document: document,
    window: window
  });

  var reactRenderApp = require('./react-render-app');

  app.use(reactRenderApp({
    RootComponent: App,
    app: app,
    browserEnv: browserEnv,
    document: options.document,
    localStorage: options.localStorage
  }));

  /*

    Google Image Search
    -------------------
    browser version

  */

  var imageSearch = function(searchTerm, callback) {
    request('/data/images/' + searchTerm, function(err, res, body) {
      if (err) {
        return callback(true, []);
      }
      var images = JSON.parse(body);
      callback(err, images);
    });
  }

  /*

    universalApp
    ------------
    browser version

  */

  var universalBrowserApp = require("../../jsx/universal-app.jsx")({
    app: app,
    imageSearch: imageSearch
  });

  return universalBrowserApp;

}