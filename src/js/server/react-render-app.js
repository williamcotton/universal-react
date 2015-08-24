module.exports = function(options) {

  var React = require("react");

  var ejs = require('ejs');

  var fs = require('fs');
  var template = fs.readFileSync(__dirname + '/../../ejs/index.ejs', 'utf8');

  var browserEnv = options.browserEnv;
  var app = options.app;
  var defaultTitle = browserEnv.defaultTitle;
  var RootComponent = React.createFactory(options.RootComponent);
  
  var formatTitle = options.formatTitle || require('../format-title');

  var cookieParser = require('cookie-parser');
  var session = require('./session');

  app.use(cookieParser());
  app.use(session);

  return function(req, res, next) {
    res.renderApp = function(content, opts) {
      var title = formatTitle(defaultTitle, opts ? opts.title : false);
      var HTML = React.renderToStaticMarkup(RootComponent({
        content: content,
        opts: opts,
        browserEnv: browserEnv,
        session: req.session
      }));
      // should it use react to render instead of ejs?
      // https://gist.github.com/williamcotton/48a42b58e413804343a2
      var content = ejs.render(template, { HTML: HTML, title: title, browserEnv: browserEnv }, {});
      res.send(content);
    };
    next();
  }

}