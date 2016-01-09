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

var FrontPage = require('../../src/jsx/front-page.jsx')

test('FrontPage component', function (t) {
  t.test('should create the component', function (t) {
    var className = 'front-page-container'
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(FrontPage, {}))
    var elements = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, className)
    var elementClassName = elements.length ? elements[0].className : false
    t.equal(elementClassName, className, 'has className ' + className)
    t.end()
  })

  t.end()
})
