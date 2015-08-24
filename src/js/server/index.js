var nodeEnv = process.env.NODE_ENV;
var defaultTitle = process.env.DEFAULT_TITLE;
var port = process.env.PORT || 5000;

var universalServerApp = require('./app')({
  port: port,
  defaultTitle: defaultTitle,
  nodeEnv: nodeEnv
});

universalServerApp.listen(port, function() {
  console.log('universalServerApp is running in %s mode on port %s', nodeEnv, port);
});