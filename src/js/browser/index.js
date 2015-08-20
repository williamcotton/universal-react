var browserApp = require('./app')({
  localStorage: window.localStorage,
  document: document,
  window: window,
  browserEnv: window.browserEnv
});

browserApp.listen(function() {
  console.log("%cUniversal React browserApp is running in %s mode on %s", "color:blue; font-size: 6pt", window.browserEnv.nodeEnv, window.location.host);
});