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
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(FrontPage, {}));
    var frontPageContainer = TestUtils.findRenderedDOMComponentWithClass(renderedComponent, "front-page-container").getDOMNode();
    t.ok(frontPageContainer, "created FrontPage DOM element");
    t.end();
  });

  t.end();

});