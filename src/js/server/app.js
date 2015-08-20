module.exports = function(options) {

  var defaultTitle = options.defaultTitle;
  var nodeEnv = options.nodeEnv;
  var port = options.port;

  var browserEnv = {
    nodeEnv: nodeEnv
  };

  var React = require("react");
  require('node-jsx').install({extension: '.jsx'});

  var express = require('express');
  var cookieParser = require('cookie-parser');
  var serverSession = require('./session');

  /*

    app
    ---
    server version
    
  */

  var serverApp = express();
  var publicDir = __dirname + '/../../../public';
  serverApp.set('port', port);
  serverApp.set('view engine', 'ejs');
  serverApp.set('views', __dirname + '/../../ejs');
  serverApp.use(cookieParser());
  serverApp.use(serverSession);
  serverApp.use(express.static(publicDir));

  /*

    renderApp
    ---------
    server version

  */

  var renderServerApp = function(content, req, res, opts) {
    var App = React.createFactory(require('../../jsx/app.jsx'));
    var title = defaultTitle + (opts ? " - " + opts.title : "");
    var HTML = React.renderToStaticMarkup(App({
      content: content,
      opts: opts,
      browserEnv: browserEnv,
      session: req.session
    }));
    res.render('index', { HTML: HTML, title: title, browserEnv: browserEnv });
  };

  /*

    Google Image Search
    -------------------
    server version

  */

  var googleImages = require("google-images");

  var imageSearch = function(searchTerm, callback) {
    googleImages.search(searchTerm, callback);
  };

  serverApp.get("/data/images/:searchTerm", function(req, res) {
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

  var universalServerApp = require("../universal-app")({
    renderApp: renderServerApp,
    app: serverApp,
    imageSearch: imageSearch
  });

  var server;

  return {
    port: serverApp.get("port"),
    listen: function(port, callback) {
      server = serverApp.listen(port, callback);
    },
    close: function() {
      server.close();
    }
  };

}