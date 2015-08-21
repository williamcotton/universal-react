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

var Login = require("../../src/jsx/login.jsx");

test('Login component', function (t) {

  t.test('should create the component', function (t) {
    var className = "login-container";
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(Login, { }));
    var elements = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, className);
    var element = elements.length ? elements[0].getDOMNode() : false;
    t.ok(element, "has className " + className);
    t.end();
  });

  t.test('should call the login function', function (t) {
    var username = "test-name";
    t.plan(3);
    var loginFunction = function(options, callback) {
      callback(false, {success: true, username: options.username});
      renderedComponent.forceUpdate(function() {
        t.equal(renderedComponent.state.didLogin, true, "updated Login state:didLogin");
        t.equal(renderedComponent.state.username, username, "updated Login state:username");
        t.equal(options.username, username, "called login function with username");
      });
    }
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(Login, { login: loginFunction }));
    var submitButton = TestUtils.findRenderedDOMComponentWithTag(renderedComponent, 'button').getDOMNode();
    var usernameInput = TestUtils.findRenderedDOMComponentWithTag(renderedComponent, 'input').getDOMNode();
    usernameInput.value = username;
    TestUtils.Simulate.click(submitButton, {});
  });

  t.end();

});