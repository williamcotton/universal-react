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