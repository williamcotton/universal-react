# Universal React

Universal React is an example of a web application architecture that renders HTML both statically on the server as well as dynamically in the browser using the same React components and express-style routing engine.

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

This ```universalApp``` module is executed in **both the server and the browser environment**.

This means that while the  ```app``` object is very different between the browser and server environments, it still presents the same interface.

```js
var React = require('react')

var FrontPage = require('./front-page.jsx')
var About = require('./about.jsx')
var Calculator = require('./calculator.jsx')

var universalApp = function (options) {
  var app = options.app

  app.get('/', function (req, res) {
    var content = <FrontPage />
    res.renderApp(content)
  })

  app.get('/about', function (req, res) {
    var content = <About />
    res.renderApp(content, {title: 'About'})
  })

  app.get('/calculator', function (req, res) {
    var content = <Calculator />
    res.renderApp(content, {title: 'Calculator'})
  })

  app.post('/calculator', function (req, res) {
    var firstNumber = parseFloat(req.body.firstNumber)
    var secondNumber = parseFloat(req.body.secondNumber)
    var operation = req.body.operation
    var result
    switch (operation) {
      case '+':
        result = firstNumber + secondNumber
        break
      case '-':
        result = firstNumber - secondNumber
        break
    }
    var content = <Calculator result={result} firstNumber={firstNumber} secondNumber={secondNumber} operation={operation} />
    res.renderApp(content, {title: 'Calculator'})
  })

  return app
}

module.exports = universalApp

```

## serverApp

The server app is instantiated in [```src/js/server/index.js```](https://github.com/williamcotton/universal-react/blob/master/src/js/server/index.js).

```js
var nodeEnv = process.env.NODE_ENV
var defaultTitle = process.env.DEFAULT_TITLE
var port = process.env.PORT || 5000

var universalServerApp = require('./app')({
  port: port,
  defaultTitle: defaultTitle,
  nodeEnv: nodeEnv
})

universalServerApp.listen(port, function () {
  console.log('universalServerApp is running in %s mode on port %s', nodeEnv, port)
})

```

And is run, as shown in the Procfiles:

```node src/js/server/index.js```

The app has options for a ```defaultTitle```, ```port```, and the NODE_ENV variable passed in as ```nodeEnv```.

#### ```app```

Found  in [```src/js/server/app.js```](https://github.com/williamcotton/universal-react/blob/master/src/js/server/app.js).

The server environment instantiates a standard [express](http://expressjs.com/) app.

```js
module.exports = function (options) {
  var defaultTitle = options.defaultTitle
  var nodeEnv = options.nodeEnv
  var port = options.port

  /*

    view template
  */

  var fs = require('fs')
  var template = fs.readFileSync(__dirname + '/../../ejs/index.ejs', 'utf8')

  /*

    app
    ---
    server version

  */

  require('node-jsx').install({extension: '.jsx'})
  var App = require('../../jsx/app.jsx')

  var express = require('express')
  var app = express()

  var compression = require('compression')
  app.use(compression())

  var bodyParser = require('body-parser')
  app.use(bodyParser.urlencoded({ extended: false }))

  var reactRenderApp = require('./react-render-app')
  app.use(reactRenderApp({
    template: template,
    app: app,
    RootComponent: App,
    browserEnv: {
      nodeEnv: nodeEnv
    },
    defaultTitle: defaultTitle,
    rootDOMId: 'universal-app-container'
  }))

  /*

    universalApp
    ------------
    server version

  */

  var universalServerApp = require('../../jsx/universal-app.jsx')({
    app: app
  })

  var publicDir = __dirname + '/../../../public'
  app.use(express.static(publicDir))

  return universalServerApp

}

```

#### reactRenderApp

The server also uses a custom middleware to create a ```res.renderApp``` function that renders React components to static HTML before injecting them in to a simple EJS view that is sent as a response. 

The EJS view loads static resources like ```build.js``` and ```build.css``` from the the ```public/``` directory, passes the browserEnv object to the browser as a global variable, and renders an HTML DIV element with the id ```rootId```, which in this case is ```universal-app-container```.

```js
...
return function (req, res, next) {
  var navigate = function (pathname) {
    res.redirect(pathname)
  }
  res.renderApp = function (content, opts) {
    var title = formatTitle(options.defaultTitle, opts ? opts.title : false)
    contentProps.navigate = navigate
    var contentWithProps = React.cloneElement(content, contentProps)
    var HTML = ReactDOMServer.renderToStaticMarkup(RootComponent({
      content: contentWithProps,
      opts: opts
    }))
    var renderedTemplate = ejs.render(template, { HTML: HTML, title: title, rootDOMId: options.rootDOMId, browserEnv: options.browserEnv }, {})
    res.send(renderedTemplate)
  }
  next()
}
...
```  

## browserApp

Like the serverApp, the browserApp is instantiated in [```src/js/browser/index.js```](https://github.com/williamcotton/universal-react/blob/master/src/js/browser/index.js).

```js
var request = require('request')

var universalBrowserApp = require('./app')({
  localStorage: window.localStorage,
  document: document,
  window: window,
  browserEnv: window.browserEnv,
  request: request
})

universalBrowserApp.listen(function () {
  console.log('%cuniversalBrowserApp is running in %s mode on %s', 'color:blue; font-size: 6pt', window.browserEnv.nodeEnv, window.location.host)
})

```

It is bundled up in to a single JavaScript file in the ```public/``` directory:

```browserify src/js/browser/index.js -t [ babelify --presets [ es2015 react ] ] > public/build.js```

This ```build.js``` file is rendered statically by the EJS view in the server-side express ```reactRenderApp``` middleware.

To help with testing, browser specific global objects like ```document```, ```window``` and ```localStorage``` are passed in as options, along with the ```browserEnv``` and an instance of the universal ```browser-request```.

#### ```app```

In the browser, the ```app``` uses an instance of [```browser-express```](https://github.com/williamcotton/browser-express), a pushState routing engine that exposes the same interface for routes and middleware as ```express```.

```js
module.exports = function (options) {
  var browserEnv = options.browserEnv

  /*

    app
    ---
    browser version

  */

  var React = require('react')
  var App = require('../../jsx/app.jsx')

  var express = require('browser-express')
  var app = express({
    interceptLinks: true,
    interceptFormSubmit: true,
    document: document,
    window: window
  })

  var reactRenderApp = require('./react-render-app')

  app.use(reactRenderApp({
    RootComponent: App,
    app: app,
    contentProps: {
      browserEnv: browserEnv
    },
    rootDOMId: 'universal-app-container',
    defaultTitle: 'Universal App',
    document: options.document,
    localStorage: options.localStorage
  }))

  /*

    universalApp
    ------------
    browser version

  */

  var universalBrowserApp = require('../../jsx/universal-app.jsx')({
    app: app
  })

  return universalBrowserApp

}

```

#### reactRenderApp

Like the server, the browserApp also uses custom middleware that creates a ```res.renderApp``` function, but one that uses the standard React.render to inject the App dynamically in to the DOM.

```js
...
return function (req, res, next) {
  res.renderApp = function (content, opts) {
    options.document.title = formatTitle(options.defaultTitle, opts ? opts.title : false)
    var contentWithProps = React.cloneElement(content, contentProps)
    ReactDOM.render(RootComponent({
      content: contentWithProps,
      opts: opts
    }), options.document.getElementById(options.rootDOMId))
  }
  next()
}
...
```

## App.jsx

This is the root React component and is used much like an application layout in a framework like Ruby on Rails. HTTP requests are mapped to specific React modules that are passed in as the ```content``` options.

Before the ```content``` component is rendered, it is cloned and given some new properties that pertain to the app, as specified by the ```contentProps``` option passed to ```reactRenderApp```.

The ```navigate(path)``` function triggers the ```browserApp``` to navigate to the provided path argument. See the [```prouter```](https://github.com/rogerpadilla/prouter) documentation for more information.

```js
var React = require('react')

var ReactBootstrap = require('react-bootstrap')

var Navbar = ReactBootstrap.Navbar
var Nav = ReactBootstrap.Nav
var NavDropdown = ReactBootstrap.NavDropdown
var MenuItem = ReactBootstrap.MenuItem

var App = React.createClass({
  propTypes: {
    content: React.PropTypes.element
  },
  render: function () {
    var content = this.props.content
    return <div className='app-container'>
      <Navbar inverse className='navbar-container'>
        <Navbar.Header>
          <Navbar.Brand>
            <a href='/'>Universal App</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Nav pullRight>
          <NavDropdown title='Menu' id='main'>
            <MenuItem href='/'>Front Page</MenuItem>
            <MenuItem href='/about'>About</MenuItem>
            <MenuItem href='/calculator'>Calculator</MenuItem>
          </NavDropdown>
        </Nav>
      </Navbar>
      <div className='content'>
        { content }
      </div>
    </div>
  }
})

module.exports = App

```

## Content components

Components like [```calculator.jsx```](https://github.com/williamcotton/universal-react/blob/master/src/jsx/calculator.jsx) will be rendered inside of the root App component.

```js
var React = require('react')
var ReactBootstrap = require('react-bootstrap')
var Input = ReactBootstrap.Input
var ButtonInput = ReactBootstrap.ButtonInput

var Calculator = React.createClass({
  propTypes: {
    result: React.PropTypes.number,
    firstNumber: React.PropTypes.number,
    secondNumber: React.PropTypes.number,
    operation: React.PropTypes.string
  },
  render: function () {
    return <div className='calculator-container'>
      <h1>Calculator</h1>
      <form action='/calculator' method='post'>
        <Input name='firstNumber' type='number' defaultValue={this.props.firstNumber} />
        <Input name='operation' type='select' defaultValue={this.props.operation} placeholder='+'>
          <option value='+'>+</option>
          <option value='-'>-</option>
        </Input>
        <Input name='secondNumber' type='number' defaultValue={this.props.secondNumber} />
        <ButtonInput type='submit' value='Calculate' />
        { this.props.result ? this.props.firstNumber + ' ' + this.props.operation + ' ' + this.props.secondNumber + ' = ' + this.props.result : false }
      </form>
    </div>
  }
})

module.exports = Calculator

```

Here, when a user searches, the ```navigate()``` function is called with a new path to be rendered. This does not trigger a full page reload, rather it uses browser history pushState to dynamically call the route handler and rebuild the view in the browser, saving a full round trip call to the server.

## index.ejs

This is the basic template that is rendered by the ```reactRenderApp``` middleware in the ```serverApp``` and used to load the ```browserApp``` that was bundled in to ```public/build.js```.

Importantly, it prerenders the React App on the server in to the ```rootDOMId``` (```universal-app-container```) DOM element.

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
    window.browserEnv = <%- JSON.stringify(browserEnv) %>;
  </script>
</head>
<body>
  <div id="<%- rootDOMId %>"><%- HTML %></div>
  <script src='/build.js' type='text/javascript' charset='utf-8'></script>
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
  ./node_modules/.bin/browserify src/js/browser/index.js -t [ babelify --presets [ es2015 react ] ] > $@

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
var test = require('tapes')
var jsdom = require('jsdom')

if (!global.document) {
  global.document = jsdom.jsdom('<!doctype html><html><body><div id="universal-app-container"></div></body></html>')
  global.window = global.document.parentWindow
  global.navigator = {
    userAgent: 'node.js'
  }
}

var React = require('react/addons')
var TestUtils = React.addons.TestUtils
require('node-jsx').install({extension: '.jsx'})

var FrontPage = require('../../src/jsx/front-page.jsx')

test('FrontPage component', function (t) {
  t.test('should create the component', function (t) {
    var className = 'front-page-container'
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(FrontPage, {}))
    var elements = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, className)
    var element = elements.length ? elements[0].getDOMNode() : false
    t.ok(element, 'has className ' + className)
    t.end()
  })

  t.end()
})

```

#### universalAppSpec

The specs for [```serverApp```](https://github.com/williamcotton/universal-react/blob/master/test/js/server/app-spec.js) and [```browserApp```](https://github.com/williamcotton/universal-react/blob/master/test/js/browser/app-spec.js) both load [```universalAppSpec```](https://github.com/williamcotton/universal-react/blob/master/test/js/universal-app-spec.js).

This is used as to make sure that both the server and the browser are rendering the same basic HTML given the same route.

Amongst other environmental specifics, the [```serverApp``` tests](https://github.com/williamcotton/universal-react/blob/master/test/js/server/app-spec.js) define a ```domRoute``` function based on [```request```](https://github.com/request/request) and [```cheerio```](https://github.com/cheeriojs/cheerio).

```js
var domRoute = function (route, callback) {
  request(baseUrl + route, function (err, res, body) {
    var $ = cheerio.load(body, {xmlMode: true})
    callback($)
  })
}
```

While the [```browserApp``` tests](https://github.com/williamcotton/universal-react/blob/master/test/js/browser/app-spec.js) define a domRoute based on jQuery and the ```navigate()``` function inherited by ```browser-express``` from ```prouter```. See the tests themselves for more details.

```js
var domRoute = function (route, callback) {
  browserApp.navigate(route)
  callback(global.window.$)
}
```

This means the ```domRoute``` function is defined in **two different environments** and passed in as options to a **single test suite**, similar to modules like  [```abstract-blob-store```](https://github.com/maxogden/abstract-blob-store), suggesting some deeper relationships between environmental abstractions and test suites as modules.

```js
module.exports = function(t, domRoute, defaultTitle) {

  ...

  t.test('should create the App component', function (t) {
    t.plan(1)
    domRoute('/', function ($) {
      var container = $('.app-container').html()
      t.ok(container, 'created App component')
    })
  })

  t.test('should have the defaultTitle', function (t) {
    t.plan(1)
    domRoute('/', function ($) {
      var title = $('title').html()
      t.equal(title, defaultTitle, 'created proper title')
    })
  })

  t.test('should have routes mapped for all of the defined routes', function (t) {
    var routes = Object.keys(routesMap)
    var diff = arr_diff(routes, definedRoutes)
    var message = 'has same number of mapped routes as defined routes'
    if (diff) {
      message += ' - missing: ' + diff
    }
    t.equal(routes.length, definedRoutes.length, message)
    t.end()
  })

  t.test('should load all the routes specified in the routes map and find the expected DOM elements', function (t) {
    var routes = Object.keys(routesMap)
    t.plan(routes.length)
    async.each(routes, function (route, callback) {
      var className = routesMap[route]
      domRoute(route, function ($) {
        var container = $('.' + className).html()
        t.ok(container, route + ' has ' + className)
        callback()
      })
    })
  })

};
```  

The ```routesMap``` is auto-generated using a ```mockApp``` passed through a testing instance of ```universalApp```.

This means we can test each and every route we've defined in our ```universalApp``` to make sure it renders on both the client and the server, without coupling our tests to our implementation and needing to manually maintain a ```routesMap```.

This is not meant to test the functionality of the React components, rather just that the routes are rendering properly in both environments.

```js
var React = require('react/addons')
var TestUtils = require('react-addons-test-utils')
...
var Router = require('router')
var router = new Router()
...
var definedRoutes = []
var routesMap = {}

var mockApp = {
  get: function (route, handler) {
    definedRoutes.push(route)
    router.get(route, function (req, res) {
      handler(req, res)
    })
    var req = {
      url: route,
      method: 'GET'
    }
    var res = {
      renderApp: function (content, opts) {
        var shallowRenderer = TestUtils.createRenderer()
        shallowRenderer.render(content)
        var renderedOutput = shallowRenderer.getRenderOutput()
        routesMap[route] = renderedOutput.props.className
        // routesMap['/about'] = 'about-container'
      }
    }
    router.handle(req, res, function () {})
  },
}

var universalTestApp = require('../../src/jsx/universal-app.jsx')({
  app: mockApp,
  ...
})
```
