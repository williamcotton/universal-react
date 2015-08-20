/*

  Sessions
  --------
  server version

*/

var serverSession = function(req, res, next) {
  var cookies = req.cookies;
  var session = {
    get: function(key) {
      var sessionObjectJSON = cookies["session"];
      if (!sessionObjectJSON) {
        return;
      }
      var sessionObject = JSON.parse(sessionObjectJSON);
      var value = sessionObject[key];
      return value;
    },
    set: function(key, value) {},
    remove: function(key) {}
  }
  req.session = session;
  next();
}

module.exports = serverSession;