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

The main routing logic is in [```src/js/universal-app.js```](https://github.com/williamcotton/universal-react/blob/master/src/js/universal-app.js).

It connects HTTP pathnames to React components that are injected in to the root App component.

This ```universalApp``` module is executed in both the server and the browser environment.

This means that the  ```app```, ```renderApp``` and ```imageSearch``` objects are very different between the browser and server environments, yet all present the same interface.

```js
var React = require("react");

var FrontPage = React.createFactory(require('../jsx/front-page.jsx'));
var Login = React.createFactory(require('../jsx/login.jsx'));
var Images = React.createFactory(require('../jsx/images.jsx'));

var universalApp = function(options) {

  var renderApp = options.renderApp;
  var app = options.app;

  var imageSearch = options.imageSearch;

  app.get('/', function(req, res) {
    var content = FrontPage();
    renderApp(content, req, res);
  });

  app.get('/login', function(req, res) {
    var content = Login();
    renderApp(content, req, res, {title: "Login"});
  });

  app.get('/images', function(req, res) {
    var content = Images();
    renderApp(content, req, res, {title: "Images"});
  });

  app.get('/images/:searchTerm', function(req, res) {
    var searchTerm = req.params.searchTerm;
    imageSearch(searchTerm, function(err, images) {
      var content = Images({images: images, searchTerm: searchTerm});
      renderApp(content, req, res, {title: "Images - " + searchTerm});
    });
  });

  return app;

}

module.exports = universalApp;
```

## serverApp

The server app is instantiated in [```src/js/server/index.js```](https://github.com/williamcotton/universal-react/blob/master/src/js/server/index.js).

And is run, as shown in the Procfiles:

```node src/js/server/index.js```

The app has options for a ```defaultTitle```, ```port```, and node environmental variables passed in as ```nodeEnv```.

It also creates a ```browserEnv``` object that is passed up through to the browser.

```js
var defaultTitle = options.defaultTitle;
var nodeEnv = options.nodeEnv;
var port = options.port;

var browserEnv = {
  nodeEnv: nodeEnv
};
```

#### ```app```

The server environment instantiates a standard [express](http://expressjs.com/) app.

```js
var express = require('express');
var cookieParser = require('cookie-parser');
var serverSession = require('./session');
  
var serverApp = express();
var publicDir = __dirname + '/../../../public';
serverApp.set('port', port);
serverApp.set('view engine', 'ejs');
serverApp.set('views', __dirname + '/../../ejs');
serverApp.use(cookieParser());
serverApp.use(serverSession);
serverApp.use(express.static(publicDir));
```

It uses the ```cookie-parser``` and a custom ```serverSession``` middleware to attach a very simple session store that is controlled from the browser.

It loads static resources like ```build.js``` and ```build.css``` from the the ```public/``` directory.

#### ```renderApp```

The server creates a function that renders React components to static HTML before injecting them in to a simple EJS view that is sent as a response.

```js
var React = require("react");
require('node-jsx').install({extension: '.jsx'});

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
```

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

These three objects are passed in as options to ```universalApp```:

```js
var universalApp = require("../universal-app")({
  renderApp: renderServerApp,
  app: serverApp,
  imageSearch: imageSearch
});
```

## browserApp

Like the serverApp, the browserApp is instantiated in [```src/js/browser/index.js```](https://github.com/williamcotton/universal-react/blob/master/src/js/browser/index.js).

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
var prouter = require("prouter");
var Router = prouter.Router;

var browserApp = {
  get: function(route, handler) {
    Router.use(route, function(req) {
      var res = {
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

#### renderApp

In the browser the renderApp function uses the standard ```React.render``` to inject the App in the the DOM.

```js
var React = require("react");
var App = React.createFactory(require('../../jsx/app.jsx'));

var renderBrowserApp = function(content, req, res, opts) {
  React.initializeTouchEvents(true);
  React.render(App({
    navigate: Router.navigate,
    content: content,
    opts: opts,
    browserEnv: browserEnv,
    session: browserSession
  }), options.document.getElementById('universal-app-container'));
};
```

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

And like with the server, these three objects are passed in as options to ```universalApp```:

```js
var universalApp = require("../universal-app")({
  renderApp: renderBrowserApp,
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

var routesMap = require('../json/routes-map.json');

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
    var route = "/";
    var className = routesMap[route];
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(FrontPage, {}));
    var frontPageContainer = TestUtils.findRenderedDOMComponentWithClass(renderedComponent, className).getDOMNode();
    t.ok(frontPageContainer, "created FrontPage DOM element");
    t.end();
  });

  t.end();

});
```

#### routesMap

The specs for [```serverApp```](https://github.com/williamcotton/universal-react/blob/master/test/js/server/app-spec.js) and [```browserApp```](https://github.com/williamcotton/universal-react/blob/master/test/js/browser/app-spec.js) load a small JSON file that maps some routes to some expected DOM elements.

This is used as to make sure that both the server and the browser are rendering the same basic HTML given the same route.

```js
{
  "/": "front-page-container",
  "/login": "login-container",
  "/images": "images-container",
  "/images/cat": "images-container"
}
```

```js
t.test('server should load all the routes specified in the routes map', function (t) {
  var routes = Object.keys(routesMap);
  t.plan(routes.length);
  async.each(routes, function(route, callback) {
    var className = routesMap[route];
    request(baseUrl + route, function(err, res, body) {
      var $ = cheerio.load(body, {xmlMode: true});
      var container = $('.' + className).html();
      t.ok(container, route + " has " + className);
      callback();
    });
  });    
});
```

```js
t.test('browser should load all the routes specified in the routes map', function (t) {
  var routes = Object.keys(routesMap);
  t.plan(routes.length);
  async.each(routes, function(route, callback) {
    var className = routesMap[route];
    browserApp.navigate(route);
    var element = global.document.querySelector("." + className);
    var container = element ? element.innerHTML : false;
    t.ok(container, route + " has " + className);
    callback();
  });    
});
```  
