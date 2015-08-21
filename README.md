# Universal React

Universal React is an example of a web application that renders HTML both statically on the server as well as dynamically in the browser using the same React components and express-style routing engine.

This means that pages are quick to load and ready to be consumed by web crawlers without having duplicate view logic for dynamic interactions.

## Getting Started

Make sure you have the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed as this application is designed to work with Heroku-style deployments including Deis.

Start by running:

```npm install```

While developing it is useful to use watchify and enable source maps with:

```npm run build-dev```

And to run a development server with:

```npm run start-dev```

## universalApp

The main routing logic is in [```src/jsx/universal-app.jsx```](https://github.com/williamcotton/universal-react/blob/master/src/jsx/universal-app.jsx).

It connects HTTP pathnames to React components that are injected in to the root App component.

This ```universalApp``` module is executed in both the server and the browser environment.

This means that the  ```app``` and ```imageSearch``` objects are very different between the browser and server environments, yet all present the same interface.

```js
var React = require("react");

var FrontPage = require('./front-page.jsx');
var Login = require('./login.jsx');
var Images = require('./images.jsx');

var universalApp = function(options) {

  var app = options.app;

  var imageSearch = options.imageSearch;

  app.get('/', function(req, res) {
    var content = <FrontPage />;
    res.renderApp(content);
  });

  app.get('/login', function(req, res) {
    var content = <Login />;
    res.renderApp(content, {title: "Login"});
  });

  app.get('/images', function(req, res) {
    var content = <Images />;
    res.renderApp(content, {title: "Images"});
  });

  app.get('/images/:searchTerm', function(req, res) {
    var searchTerm = req.params.searchTerm;
    imageSearch(searchTerm, function(err, images) {
      var content = <Images images={images} searchTerm={searchTerm} />;
      res.renderApp(content, {title: "Images - " + searchTerm});
    });
  });

  return app;

}

module.exports = universalApp;
```

## serverApp

The server app is instantiated in [```src/js/server/index.js```](https://github.com/williamcotton/universal-react/blob/master/src/js/server/index.js).

```js
var nodeEnv = process.env.NODE_ENV;
var defaultTitle = process.env.DEFAULT_TITLE;
var port = process.env.PORT || 5000;

var serverApp = require('./app')({
  port: port,
  defaultTitle: defaultTitle,
  nodeEnv: nodeEnv
});

serverApp.listen(serverApp.port, function() {
  console.log('Universal React serverApp is running in %s mode on port %s', nodeEnv, port);
});
```

And is run, as shown in the Procfiles:

```node src/js/server/index.js```

The app has options for a ```defaultTitle```, ```port```, and the NODE_ENV variable passed in as ```nodeEnv```.

It also creates a ```browserEnv``` object that is passed up through to the browser.

```js
var defaultTitle = options.defaultTitle;
var nodeEnv = options.nodeEnv;
var port = options.port;

var browserEnv = {
  nodeEnv: nodeEnv,
  defaultTitle: defaultTitle
};
```

#### ```app```

The server environment instantiates a standard [express](http://expressjs.com/) app.

```js
var React = require("react");
require('node-jsx').install({extension: '.jsx'});
var App = React.createFactory(require('../../jsx/app.jsx'));

var express = require('express');
var cookieParser = require('cookie-parser');
var serverSession = require('./session');

var formatTitle = require('../format-title');

var serverApp = express();
var publicDir = __dirname + '/../../../public';
serverApp.set('port', port);
serverApp.set('view engine', 'ejs');
serverApp.set('views', __dirname + '/../../ejs');
serverApp.use(cookieParser());
serverApp.use(serverSession);
serverApp.use(express.static(publicDir));
serverApp.use(function(req, res, next) {
  res.renderApp = function(content, opts) {
    var title = formatTitle(defaultTitle, opts.title);
    var HTML = React.renderToStaticMarkup(App({
      content: content,
      opts: opts,
      browserEnv: browserEnv,
      session: req.session
    }));
    res.render('index', { HTML: HTML, title: title, browserEnv: browserEnv });
  };
  next();
});
```

It uses the ```cookie-parser``` and a custom ```serverSession``` middleware to attach a very simple session store that is controlled from the browser.

It loads static resources like ```build.js``` and ```build.css``` from the the ```public/``` directory.

The server also uses a custom middleware to create a ```res.renderApp``` function that renders React components to static HTML before injecting them in to a simple EJS view that is sent as a response.


#### ```imageSearch```

The server wraps the ```google-images``` module in a function as well as creating an HTTP endpoint for browser-side updates.

```js
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
```

These two objects are passed in as options to ```universalApp```:

```js
var universalApp = require("../../jsx/universal-app.jsx")({
  app: serverApp,
  imageSearch: imageSearch
});
```

## browserApp

Like the serverApp, the browserApp is instantiated in [```src/js/browser/index.js```](https://github.com/williamcotton/universal-react/blob/master/src/js/browser/index.js).

```js
var request = require('request');

var browserApp = require('./app')({
  localStorage: window.localStorage,
  document: document,
  window: window,
  browserEnv: window.browserEnv,
  request: request
});

browserApp.listen(function() {
  console.log("%cUniversal React browserApp is running in %s mode on %s", "color:blue; font-size: 6pt", window.browserEnv.nodeEnv, window.location.host);
});
```

It is bundled up in to a single JavaScript file in the ```public/``` directory:

```browserify src/js/browser/index.js -t babelify > public/build.js```

To help with testing, browser specific global objects like ```document```, ```window``` and ```localStorage``` are passed in as options, along with the ```browserEnv``` and an instance of the universal ```browser-request```.

A custom ```browserSession``` object is created, built on top of localStorage and using cookies to communicate with the server.

```js
var browserEnv = options.browserEnv;
var request = options.request;

var browserSession = require('./session')({
  localStorage: options.localStorage,
  document: options.document
});
```

#### ```app```

In the browser, the ```app``` is a custom function built with ```prouter```, a pushState routing engine that uses the same routing system as ```express```.

```js
var React = require("react");
var App = React.createFactory(require('../../jsx/app.jsx'));

var prouter = require("prouter");
var Router = prouter.Router;

var formatTitle = require('../format-title');

var browserApp = {
  get: function(route, handler) {
    Router.use(route, function(req) {
      var res = {
        renderApp: function(content, opts) {
          options.document.title = formatTitle(browserEnv.defaultTitle, opts.title);
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
```

Like the server, the client also creates a ```res.renderApp``` function, but one that uses the standard React.render to inject the App dynamically in to the DOM..

#### imageSearch

In the browser, imageSearch makes an HTTP request to the previously server endpoint.

```js
var imageSearch = function(searchTerm, callback) {
  request('/data/images/' + searchTerm, function(err, res, body) {
    if (err) {
      return callback(true, []);
    }
    var images = JSON.parse(body);
    callback(err, images);
  });
}
```

And like with the server, these two objects are passed in as options to ```universalApp```:

```js
var universalApp = require("../../jsx/universal-app.jsx")({
  app: browserApp,
  imageSearch: imageSearch
});
```

## App.jsx

This is the root React component and is used much like an application layout in a framework like Ruby on Rails. HTTP requests are mapped to specific React modules that are passed in as the ```content``` options.

Before the ```content``` component is rendered, it is cloned and given some new properties that pertain to the app, the ```login``` function as well as a ```username```.

The ```login``` function sets the ```username``` to both the component's state as well as the custom cookie-based ```session```. This means that when the server is rendering the necessary components it will make sure that it also includes the ```username```.

```js
var App = React.createClass({
  getInitialState: function() {
    return {
      username: this.props.session.get("username")
    };
  },
  login: function(options, callback) {
    var username = options.username;
    this.props.session.set("username", username);
    this.setState({username: username});
    var loginReceipt = {
      success: true,
      username: username
    }
    if (callback) {
      callback(false, loginReceipt);
    }
  },
  ...
  render: function() {
    var content = React.cloneElement(this.props.content, { login: this.login, username: this.state.username, navigate: this.props.navigate });
    ...
    return (
      <div className="app-container">
        ...
        <div className="content">
          { content }
        </div>
      </div>
    );
  }
});
```

## index.ejs

This is the basic template that is rendered by the serverApp and used to load the browserApp that was bundled in to ```public/build.js```.

Importantly, it prerenders the React App on the server in to the ```universal-app-container``` DOM element.

It also injects the ```browserEnv``` in to the global window object and dynamically sets the ```title```.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title><%- title %></title>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
  <link href="/build.css" rel="stylesheet" type="text/css">
  <script type="text/javascript">
    <% // browserEnv is used to pass explicit server environmental settings to the browserApp %>
    window.browserEnv = <%- JSON.stringify(browserEnv) %>;
  </script>
</head>
<body>
  <div id="universal-app-container"><%- HTML %></div>
  <script src="/build.js" type="text/javascript" charset="utf-8"></script>
</body>
</html>
```

## Makefile

This application uses ```make``` to build. The most important logic is related to ```public/build.js``` and ```public/build.css```.

```
public/build.css:
	mkdir -p public
	./node_modules/.bin/node-sass src/scss/index.scss $@ --output-style compressed

public/build.browserify.js:
	mkdir -p public
	./node_modules/.bin/browserify src/js/browser/index.js -t babelify > $@

public/build.js: public/build.browserify.js
	mkdir -p public
	./node_modules/.bin/uglifyjs $< -m -c > $@
```

## Tests

This application has very robust test coverage.

#### JSX

For testing React components we use ```jsdom``` and the ```react-test-utils```.

This is a very simple example, but there are more complex examples in the [```Login```](https://github.com/williamcotton/universal-react/blob/master/test/jsx/login-spec.js) and [```Images```](https://github.com/williamcotton/universal-react/blob/master/test/jsx/images-spec.js) specs.

```js
var test = require('tapes');
var jsdom = require('jsdom');

if (!global.document) {
  global.document = jsdom.jsdom('<!doctype html><html><body><div id="universal-app-container"></div></body></html>');
  global.window = global.document.parentWindow;
  global.navigator = {
    userAgent: 'node.js'
  };
}

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
require('node-jsx').install({extension: '.jsx'});

var FrontPage = require("../../src/jsx/front-page.jsx");

test('FrontPage component', function (t) {

  t.test('should create the component', function (t) {
    var className = "front-page-container";
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(FrontPage, {}));
    var elements = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, className);
    var element = elements.length ? elements[0].getDOMNode() : false;
    t.ok(element, "has className " + className);
    t.end();
  });

  t.end();

});
```

#### universalAppSpec

The specs for [```serverApp```](https://github.com/williamcotton/universal-react/blob/master/test/js/server/app-spec.js) and [```browserApp```](https://github.com/williamcotton/universal-react/blob/master/test/js/browser/app-spec.js) both load [```universalAppSpec```](https://github.com/williamcotton/universal-react/blob/master/test/js/universal-app-spec.js).

This is used as to make sure that both the server and the browser are rendering the same basic HTML given the same route.

```js
module.exports = function(t, domRoute, defaultTitle) {

  ...

  t.test('should create the App component', function (t) {
    t.plan(1);
    domRoute("/", function($) {
      var container = $('.app-container').html();
      t.ok(container, "created App component");
    });
  });

  t.test('should have the defaultTitle', function (t) {
    t.plan(1);
    domRoute("/", function($) {
      var title = $('title').html();
      t.equal(title, defaultTitle, "created proper title");
    });
  });

  t.test('browser should load all the routes specified in the routes map', function (t) {
    var routes = Object.keys(routesMap);
    t.plan(routes.length);
    async.each(routes, function(route, callback) {
      var className = routesMap[route];
      domRoute(route, function($) {
        var container = $('.' + className).html();
        t.ok(container, route + " has " + className);
        callback();
      });
    });    
  });

};
```  

The ```routesMap``` is auto-generated using a ```mockApp``` passed through a testing instance of ```universalApp```.

```js
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
...
var Router = require('router');
var router = new Router();
...
var routesMap = {};

var mockApp = {
  get: function(route, handler) {
    router.get(route, function(req, res) {
      handler(req, res);
    });
    var req = {
      url: route,
      method: "GET"
    };
    var res = {
      renderApp: function(content, opts) {
        var shallowRenderer = TestUtils.createRenderer();
        shallowRenderer.render(content);
        var renderedOutput = shallowRenderer.getRenderOutput();
        routesMap[route] = renderedOutput.props.className;
      }
    }
    router.handle(req, res, function() {});
  },
};

var universalTestApp = require('../../src/jsx/universal-app.jsx')({
  app: mockApp,
  ...
});
```
