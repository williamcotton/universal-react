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

  */

  var React = require("react");
  var App = React.createFactory(require('../../jsx/app.jsx'));

  var prouter = require("prouter");
  var Router = prouter.Router;

  var browserApp = {
    get: function(route, handler) {
      Router.use(route, function(req) {
        var res = {
          renderApp: function(content, opts) {
            if (opts.title) {
              options.document.title = browserEnv.defaultTitle + " - " + opts.title;
            }
            React.initializeTouchEvents(true);
            React.render(App({
              navigate: Router.navigate,
              content: content,
              opts: opts,
              browserEnv: browserEnv,
              session: browserSession
            }), options.document.getElementById('universal-app-container'));
          },
          setHeader: function() {}
        };
        handler(req, res)
      });
    },
    listen: function(callback) {
      var router = Router.listen({
        root: "/", // base path for the handlers.
        usePushState: true, // is pushState of history API desired?
        hashChange: true, // is hashChange desired?
        silent: false // don't try to load handlers for the current path?
      });
      if (callback) {
        callback(router);
      }
    }
  }

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

  var universalApp = require("../../jsx/universal-app.jsx")({
    app: browserApp,
    imageSearch: imageSearch
  });

  return {
    listen: function(callback) {
      universalApp.listen(callback);
    },
    navigate: Router.navigate
  }

}

