var cookie = require("cookie");

/*

  Sessions
  --------
  browser version

*/

cookie.serializeObject = function(obj, options) {
  var output = ""
  for (var key in obj) {
    var value = obj[key];
    output += cookie.serialize(key, value, options) + ";";
  }
  return output;
};



var browserSession = function(options) {

  var localStorage = options.localStorage;
  var document = options.document;
  return {
    set: function(key, value) {
      var sessionObjectJSON = localStorage.getItem("session") || "{}";
      var sessionObject = JSON.parse(sessionObjectJSON);
      if (typeof(sessionObject) != "object") {
        sessionObject = {};
      }
      sessionObject[key] = value;
      sessionObjectJSON = JSON.stringify(sessionObject);
      document.cookie = cookie.serializeObject({
        "session": sessionObjectJSON
      });
      return localStorage.setItem("session", sessionObjectJSON);
    },
    get: function(key) {
      if (!localStorage.getItem("session")) {
        return;
      }
      return JSON.parse(localStorage.getItem("session"))[key];
    },
    remove: function(key) {
      var cookies = cookie.parse(document.cookie);
      var sessionObject = JSON.parse(cookies["session"]);
      delete sessionObject[key];
      var sessionObjectJSON = JSON.stringify(sessionObject);
      cookies["session"] = sessionObjectJSON;
      document.cookie = cookie.serializeObject(cookies);
      return localStorage.setItem("session", sessionObjectJSON);
    },
    removeAll: function() {
      document.cookie = "session=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      return localStorage.removeItem("session");
    }
  }
} 


module.exports = browserSession;