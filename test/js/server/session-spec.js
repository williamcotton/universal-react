var test = require('tapes');

var serverSession = require('../../../src/js/server/session');

test('server session', function (t) {

  t.test('should add a session to the request', function (t) {
    t.plan(4);
    var sessionData = {
      test: 123
    }
    var req = {
      cookies: {
        "session": JSON.stringify(sessionData)
      }
    };
    var res = {};
    var next = function() {
      t.equal(req.session.get("test"), sessionData.test, "got the session data for 'test' key");
      t.ok(req.session.set, "has set");
      t.ok(req.session.remove, "has remove");
      t.ok(req.session.removeAll, "has removeAll");
    }
    serverSession(req, res, next);
  });

  t.end();

});