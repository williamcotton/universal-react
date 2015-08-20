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

var App = require("../../src/jsx/app.jsx");

var localStorage = require('localStorage');

var browserSession = require("../../src/js/browser/session")({
  localStorage: localStorage,
  document: global.document
});

var TestContent = React.createClass({
  render: function() {
    return React.createElement('div', {className: 'test-container'}, this.props.username)
  }
});

test('App component', function (t) {

  t.test('should create the component', function (t) {
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(App, { session: browserSession, content: TestContent }));
    var appContainer = TestUtils.findRenderedDOMComponentWithClass(renderedComponent, 'app-container').getDOMNode();
    t.ok(appContainer, "created App DOM element");
    t.end();
  });

  t.test('should render the content component', function (t) {
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(App, { session: browserSession, content: TestContent }));
    var testContent = TestUtils.findRenderedDOMComponentWithClass(renderedComponent, 'test-container').getDOMNode();
    t.ok(testContent, "created TestContent DOM element");
    t.end();
  });

  t.test('should login and then return a loginReceipt, create a session element, update the browserSession, update the App component state and set the content component props', function (t) {
    t.plan(5);
    var username = "test-name";
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(App, { session: browserSession, content: TestContent }));
    renderedComponent.login({
      username: username
    }, function(err, loginReceipt) {
      t.equal(loginReceipt.success, true, "returned a loginReceipt");
    });
    var sessionContainer = TestUtils.findRenderedDOMComponentWithClass(renderedComponent, 'session-container').getDOMNode();
    t.ok(sessionContainer, "created session DOM element");
    t.equal(renderedComponent.state.username, username, "updated App state:username");
    t.equal(browserSession.get("username"), username, "updated browserSession:username");
    var testContent = TestUtils.findRenderedDOMComponentWithClass(renderedComponent, 'test-container').getDOMNode();
    t.equal(testContent.innerHTML, username, "updated content props:username");
  });

  t.end();

});