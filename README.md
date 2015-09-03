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

This means that while the  ```app``` and ```imageSearch``` objects are very different between the browser and server environments, they still present the same interface.

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

#### ```app```

Found  in [```src/js/server/app.js```](https://github.com/williamcotton/universal-react/blob/master/src/js/server/app.js).

The server environment instantiates a standard [express](http://expressjs.com/) app.

```js
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
```

#### reactRenderApp

The server also uses a custom middleware to create a ```res.renderApp``` function that renders React components to static HTML before injecting them in to a simple EJS view that is sent as a response. 

It uses the ```cookie-parser``` and a custom ```session``` middleware to attach a very simple session store that is controlled from the browser.

The EJS view loads static resources like ```build.js``` and ```build.css``` from the the ```public/``` directory, passes the browserEnv object to the browser as a global variable, and renders an HTML DIV element with the id ```rootId```, which in this case is ```universal-app-container```.

```js
...
return function(req, res, next) {
  res.renderApp = function(content, opts) {
    var title = formatTitle(defaultTitle, opts ? opts.title : false);
    var HTML = React.renderToStaticMarkup(RootComponent({
      content: content,
      opts: opts,
      browserEnv: browserEnv,
      session: req.session
    }));
    var content = ejs.render(template, { HTML: HTML, title: title, browserEnv: browserEnv }, {});
    res.send(content);
  };
  next();
}
...
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

This ```build.js``` file is rendered statically by the EJS view in the server-side express ```reactRenderApp``` middleware.

To help with testing, browser specific global objects like ```document```, ```window``` and ```localStorage``` are passed in as options, along with the ```browserEnv``` and an instance of the universal ```browser-request```.

#### ```app```

In the browser, the ```app``` uses an instance of [```browser-express```](https://github.com/williamcotton/browser-express), a pushState routing engine that exposes the same interface for routes and middleware as ```express```.

```js
var React = require('react');
var App = require('../../jsx/app.jsx');

var express = require('browser-express');
var app = express();

var reactRenderApp = require('./react-render-app');

app.use(reactRenderApp({
  RootComponent: App,
  app: app,
  browserEnv: browserEnv,
  document: options.document,
  localStorage: options.localStorage
}));
```

#### reactRenderApp

A custom ```session``` object is created, built on top of localStorage and using cookies to communicate with the server.

```js
var session = require('./session')({
  localStorage: options.localStorage,
  document: options.document
});
```

Like the server, the browserApp also uses custom middleware that creates a ```res.renderApp``` function, but one that uses the standard React.render to inject the App dynamically in to the DOM.

```js
...
return function(req, res, next) {
  res.renderApp = function(content, opts) {
    options.document.title = formatTitle(browserEnv.defaultTitle, opts ? opts.title : false);
    React.initializeTouchEvents(true);
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
...
```

#### imageSearch

In the browser, imageSearch makes an HTTP request to the previously defined server endpoint.

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

Before the ```content``` component is rendered, it is cloned and given some new properties that pertain to the app, the ```login()``` function, a ```username``` and a ```navigate()``` function.

The ```login()``` function sets the ```username``` to both the component's state as well as the custom cookie-based ```session```. This means that when the server is rendering the necessary components it will make sure that it also includes the ```username```.

The ```navigate(path)``` function triggers the ```browserApp``` to navigate to the provided path argument. See the [```prouter```](https://github.com/rogerpadilla/prouter) documentation for more information.

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
    var content = React.cloneElement(this.props.content, {
      navigate: this.props.navigate,
      login: this.login, 
      username: this.state.username
    });
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

## Content components

Components like [```images.jsx```](https://github.com/williamcotton/universal-react/blob/master/src/jsx/images.jsx) will be rendered inside of the root App component.

```js
var React = require('react');

var ReactBootstrap = require('react-bootstrap');

var Input = ReactBootstrap.Input;
var Button = ReactBootstrap.Button;

var Images = React.createClass({
  search: function(event) {
    event.preventDefault();
    var searchTerm = this.refs.searchTerm.getValue();
    this.props.navigate("/images/" + searchTerm);
  },
  render: function() {
    var searchTerm = this.props.searchTerm;
    var images = this.props.images || [];
    var createImageItem = function(image, i) {
      return <li key={i}><img src={image.url} /></li>
    }
    var header = "Images";
    if (searchTerm) {
      header += " - " + searchTerm
    }
    return (
      <div className="images-container">
        <h3>{header}</h3>
        <form className="panel panel-default" onSubmit={this.search} >
          <Input type='text' label='Search Term' ref='searchTerm' placeholder='Enter Search Term' />
          <Button bsStyle="primary" onClick={this.search}>Search</Button>
        </form>
        <ol>
          { images.map(createImageItem) }
        </ol>
      </div>
    );
  }
});

module.exports = Images;
```

Here, when a user searches, the ```navigate()``` function is called with a new path to be rendered. This does not trigger a full page reload, rather it uses browser history pushState to dynamically call the route handler and rebuild the view in the browser, saving a full round trip call to the server.

## index.ejs

This is the basic template that is rendered by the ```reactRenderApp``` middleware in the ```serverApp``` and used to load the ```browserApp``` that was bundled in to ```public/build.js```.

Importantly, it prerenders the React App on the server in to the browserEnv.rootID (```universal-app-container```) DOM element.

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
  <div id="<%- browserEnv.rootId %>"><%- HTML %></div>
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
  
  t.test('should have routes mapped for all of the defined routes', function(t) {
    var routes = Object.keys(routesMap);
    var diff = arr_diff(routes, definedRoutes);
    var message = "has same number of mapped routes as defined routes"
    if (diff) {
      message += " - missing: " + diff;
    }
    t.equal(routes.length, definedRoutes.length, message);
    t.end();
  });

  t.test('should load all the routes specified in the routes map and find the expected DOM elements', function (t) {
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
var definedRoutes = [];
var routesMap = {};

var mockApp = {
  get: function(route, handler) {
    definedRoutes.push(route);
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
        // routesMap['/login'] = 'login-container';
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
