var request = require('request')

var universalBrowserApp = require('./app')({
  localStorage: window.localStorage,
  document: document,
  window: window,
  request: request
})

universalBrowserApp.listen(function () {
  console.log('%cuniversalBrowserApp is running in %s mode on %s', 'color:blue; font-size: 6pt', 'development', window.location.host)
  universalBrowserApp.navigate('/')
})
