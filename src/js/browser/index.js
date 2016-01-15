var request = require('request')

var universalBrowserApp = require('./app')({
  localStorage: window.localStorage,
  document: document,
  window: window,
  request: request
})

universalBrowserApp.listen(function () {
  console.log('%cuniversalBrowserApp is running on %s', 'color:blue; font-size: 6pt', window.location.host)
})
