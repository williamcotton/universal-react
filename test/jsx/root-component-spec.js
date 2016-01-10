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

var RootComponent = require('../../src/jsx/root-component.jsx')

var testContentClassName = 'test-container'

var TestContent = React.createClass({
  render: function () {
    return React.createElement('div', {className: testContentClassName})
  }
})

test('Root Component', function (t) {
  // expect.rootComponentToBeRendered(t)

  t.test('should render the root component in the DOM', function (t) {
    var className = 'root-component-container'
    var contentElement = React.createElement(TestContent)
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(RootComponent, { content: contentElement }))
    var elements = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, className)
    var elementClassName = elements.length ? elements[0].className : false
    t.equal(elementClassName, className, 'has className ' + className)
    t.end()
  })

  // expect.contentToBeRenderedIntoRoot(t)

  t.test('should render the content component in the DOM', function (t) {
    var contentElement = React.createElement(TestContent)
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(RootComponent, { content: contentElement }))
    var elements = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, testContentClassName)
    var elementClassName = elements.length ? elements[0].className : false
    t.equal(elementClassName, testContentClassName, 'has className ' + testContentClassName)
    t.end()
  })

  t.end()
})
