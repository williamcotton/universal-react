module.exports = function(options) {

  var React = require("react");

  var browserEnv = options.browserEnv;
  var RootComponent = React.createFactory(options.RootComponent);
  var app = options.app;
  
  var formatTitle = options.formatTitle || require('../format-title');

  var session = require('./session')({
    localStorage: options.localStorage,
    document: options.document
  });
  
  return function(req, res, next) {
    res.renderApp = function(content, opts) {
      options.document.title = formatTitle(browserEnv.defaultTitle, opts ? opts.title : false);
      React.initializeTouchEvents(true);
      // should it call React.render every time, or should it update the content and opts with setState?
      React.render(RootComponent({
        navigate: app.navigate,
        content: content,
        opts: opts,
        browserEnv: browserEnv,
        session: session
      }), options.document.getElementById(browserEnv.rootId));
    };
    next();
  }

}