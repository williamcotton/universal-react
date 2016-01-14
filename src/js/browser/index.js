var request = require('request')

var universalBrowserApp = require('./app')({
  localStorage: window.localStorage,
  document: document,
  window: window,
  browserEnv: window.browserEnv,
  serverSession: window.serverSession,
  request: request
})

universalBrowserApp.listen(function () {
  console.log('%cuniversalBrowserApp is running in %s mode on %s', 'color:blue; font-size: 6pt', window.browserEnv.nodeEnv, window.location.host)
})
