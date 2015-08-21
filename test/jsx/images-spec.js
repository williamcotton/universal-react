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

var Images = require("../../src/jsx/images.jsx");

test('Images component', function (t) {

  t.test('should create the component', function (t) {
    var route = "/images";
    var className = routesMap[route];
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(Images, {}));
    var frontPageContainer = TestUtils.findRenderedDOMComponentWithClass(renderedComponent, className).getDOMNode();
    t.ok(frontPageContainer, "created Images DOM element");
    t.end();
  });

  t.test('should load some images', function (t) {
    var images = [{url:"http://test.com/1.png"},{url:"http://test.com/2.png"}]
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(Images, {images: images}));
    var imagesList = TestUtils.scryRenderedDOMComponentsWithTag(renderedComponent, "img");
    t.equal(imagesList.length, images.length, "created correct number of images");
    t.equal(imagesList[0].getDOMNode().src, images[0].url, "created correct image src");
    t.equal(imagesList[1].getDOMNode().src, images[1].url, "created correct image src");
    t.end();
  });

  t.test('should navigate to new location when searching', function (t) {
    var searchTerm = "cat";
    t.plan(1);
    var navigateFunction = function(pathname) {
      t.equal(pathname, "/images/" + searchTerm, "called navigate function with " + "/images/" + searchTerm);
    }
    var renderedComponent = TestUtils.renderIntoDocument(React.createElement(Images, {navigate: navigateFunction}));
    var submitButton = TestUtils.findRenderedDOMComponentWithTag(renderedComponent, 'button').getDOMNode();
    var searchTermInput = TestUtils.findRenderedDOMComponentWithTag(renderedComponent, 'input').getDOMNode();
    searchTermInput.value = searchTerm;
    TestUtils.Simulate.click(submitButton, {});
  });

  t.end();

});