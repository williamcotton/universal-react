module.exports = function (options) {
  var Datastore = require('nedb')
  var db = new Datastore()

  return {
    getUserCredentials: function (credentials, callback) {
      db.find({ uuid: credentials.uuid, type: credentials.type }, function (err, users) {
        var user = users[0]
        if (err || !user) {
          return callback(err, false)
        }
        callback(err, {
          hash: user.hash,
          type: user.type,
          uuid: user.uuid,
          user_uuid: user._id,
          verified: user.verified
        })
      })
    },
    setVerified: function (options, callback) {
      db.find(options, function (err, users) {
        var user = users[0]
        user.verified = true
        db.update(options, user, {}, function () {
          callback(false, user)
        })
      })
    },
    setHash: function (options, callback) {
      db.find({uuid: options.uuid}, function (err, users) {
        var user = users[0]
        user.hash = options.hash
        db.update(options, user, {}, function () {
          callback(false, user)
        })
      })
    },
    create: function (credentials, callback) {
      var user = {
        type: credentials.type,
        uuid: credentials.uuid,
        verified: false,
        hash: credentials.hash
      }
      db.insert(user, function (err, newUser) {
        callback(err, newUser)
      })
    },
    destroy: function (credentials, callback) {
      db.remove({ uuid: credentials.uuid, type: credentials.type }, function (err, removedUser) {
        callback(err)
      })
    },
    setup: function (callback) {
      // nothing to do!
      callback(false, true)
    }
  }
}
