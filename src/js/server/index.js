var nodeEnv = process.env.NODE_ENV;
var defaultTitle = process.env.DEFAULT_TITLE;
var port = process.env.PORT || 5000;

var serverApp = require('./app')({
  port: port,
  defaultTitle: defaultTitle,
  nodeEnv: nodeEnv
});

serverApp.listen(port, function() {
  console.log('Universal React serverApp is running in %s mode on port %s', nodeEnv, port);
});