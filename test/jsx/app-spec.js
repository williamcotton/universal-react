var test = require('tapes')
var jsdom = require('jsdom')

if (!global.document) {
  global.document = jsdom.jsdom('<!doctype html><html><body><div id="universal-app-container"></div></body></html>')
  global.window = global.document.parentWindow
  global.navigator = {
    userAgent: 'node.js'
  }
}

var React = require('react')
var TestUtils = require('react-addons-test-utils')
require('node-jsx').install({extension: '.jsx'})

var App = require('../../src/jsx/app.jsx')

var testContentClassName = 'test-container'

var TestContent = React.createClass({
  render: function () {
    console.log('creating test element', testContentClassName)
    return React.createElement('div', {className: testContentClassName})
  }
})

test('App component', function (t) {
  t.afterEach(function (t) {
    t.end()
  })

  t.test('should create the component', function (t) {
    var className = 'app-container'
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(App, { content: TestContent }))
    var elements = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, className)
    var element = elements.length ? elements[0].getDOMNode() : false
    t.ok(element, 'has className ' + className)
    t.end()
  })

  t.test('should render the content component', function (t) {
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(App, { content: TestContent }))
    // var elements = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, testContentClassName)
    TestUtils.findAllInRenderedTree(renderedComponent, function (a, b) {
      console.log(a, b)
    })
    // var element = elements.length ? elements[0].getDOMNode() : false
    // t.ok(element, 'has TestContent with className ' + testContentClassName)
    t.end()
  })

  t.end()
})
