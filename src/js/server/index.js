var nodeEnv = process.env.NODE_ENV;
var defaultTitle = process.env.DEFAULT_TITLE;
var port = process.env.PORT || 5000;

var colors = require('colors');

var serverApp = require('./app')({
  port: port,
  defaultTitle: defaultTitle,
  nodeEnv: nodeEnv
});

serverApp.listen(serverApp.port, function() {
  console.log(colors.blue('Universal React serverApp is running in %s mode on port %s'), nodeEnv, port);
});