module.exports = function(options) {

  var browserEnv = options.browserEnv;
  var request = options.request;

  var browserSession = require('./session')({
    localStorage: options.localStorage,
    document: options.document
  });

  /*

    app
    ---
    browser version

    should it call React.render every time, or should it update the content and opts with setState?

  */

  var React = require("react");
  var App = React.createFactory(require('../../jsx/app.jsx'));

  var browserExpress = require('browser-express');
  var browserApp = browserExpress();

  var formatTitle = require('../format-title');  

  browserApp.use(function(req, res, next) {
    res.renderApp = function(content, opts) {
      options.document.title = formatTitle(browserEnv.defaultTitle, opts ? opts.title : false);
      React.initializeTouchEvents(true);
      React.render(App({
        navigate: browserApp.navigate,
        content: content,
        opts: opts,
        browserEnv: browserEnv,
        session: browserSession
      }), options.document.getElementById('universal-app-container'));
    };
    next();
  });

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
    app: browserApp,
    imageSearch: imageSearch
  });

  return universalBrowserApp;

}

