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

var testContentClassName = 'test-container';

var TestContent = React.createClass({
  render: function() {
    return React.createElement('div', {className: testContentClassName}, this.props.username)
  }
});

test('App component', function (t) {

  t.afterEach(function(t) {
    browserSession.removeAll();
    t.end();
  });

  t.test('should create the component', function (t) {
    var className = "app-container";
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(App, { session: browserSession, content: TestContent }));
    var elements = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, className);
    var element = elements.length ? elements[0].getDOMNode() : false;
    t.ok(element, "has className " + className);
    t.end();
  });

  t.test('should render the content component', function (t) {
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(App, { session: browserSession, content: TestContent }));
    var elements = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, testContentClassName);
    var element = elements.length ? elements[0].getDOMNode() : false;
    t.ok(element, "has TestContent with className " + testContentClassName);
    t.end();
  });

  t.test('should login and then return a loginReceipt, create a session element, update the browserSession, update the App component state and set the content component props', function (t) {
    var sessionClassName = "session-container";
    var elements;
    t.plan(5);
    var username = "test-name-0";
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(App, { session: browserSession, content: TestContent }));
    renderedComponent.login({
      username: username
    }, function(err, loginReceipt) {
      t.equal(loginReceipt.success, true, "returned a loginReceipt");
    });
    elements = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, sessionClassName);
    var sessionContainer = elements.length ? elements[0].getDOMNode() : false;
    t.ok(sessionContainer, "created session DOM element");
    t.equal(renderedComponent.state.username, username, "updated App state:username");
    t.equal(browserSession.get("username"), username, "updated browserSession:username");
    elements = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, testContentClassName);
    var testContent = elements.length ? elements[0].getDOMNode() : false;
    t.equal(testContent.innerHTML, username, "updated content props:username");
  });

  t.test('should login and then logout and have an empty session', function (t) {
    t.plan(3);
    var username = "test-name-1";
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(App, { session: browserSession, content: TestContent }));
    renderedComponent.login({
      username: username
    }, function(err, loginReceipt) {
      t.equal(loginReceipt.success, true, "returned a loginReceipt");
      renderedComponent.logout();
      t.notOk(browserSession.get("username"), "deleted browserSession:username");
      t.notOk(renderedComponent.state.username, "deleted App state:username");
    });
  });

  t.test('should create the component and have the state:username from browserSession:username', function (t) {
    var username = "test-name-2";
    browserSession.set("username", username);
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(App, { session: browserSession, content: TestContent }));
    t.equal(renderedComponent.state.username, username, "has App state:username");
    t.end();
  });

  t.test('should create the component and not have state:username', function (t) {
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(App, { session: browserSession, content: TestContent }));
    t.notOk(renderedComponent.state.username, "has no App state:username");
    t.end();
  });

  t.end();

});