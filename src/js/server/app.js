module.exports = function(options) {

  var defaultTitle = options.defaultTitle;
  var nodeEnv = options.nodeEnv;
  var port = options.port;

  /*

    app
    ---
    server version
    
  */

  var React = require("react");
  require('node-jsx').install({extension: '.jsx'});
  var App = require('../../jsx/app.jsx');

  var express = require('express');
  var app = express();

  var compression = require('compression');
  app.use(compression());

  var publicDir = __dirname + '/../../../public';
  app.use(express.static(publicDir));

  var reactRenderApp = require('./react-render-app');
  app.use(reactRenderApp({
    app: app,
    RootComponent: App,
    browserEnv: {
      nodeEnv: nodeEnv,
      defaultTitle: defaultTitle,
      rootId: 'universal-app-container'
    }
  }));



  /*

    Google Image Search
    -------------------
    server version

  */

  var googleImages = require("google-images");

  var imageSearch = function(searchTerm, callback) {
    googleImages.search(searchTerm, callback);
  };

  app.get("/data/images/:searchTerm", function(req, res) {
    var searchTerm = req.params.searchTerm;
    imageSearch(searchTerm, function(err, images) {
      res.send(images);
    });
  }); 

  /*

    universalApp
    ------------
    server version

  */

  var universalServerApp = require("../../jsx/universal-app.jsx")({
    app: app,
    imageSearch: imageSearch
  });

  return universalServerApp;

}