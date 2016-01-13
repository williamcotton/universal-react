module.exports = function (options) {
  var Datastore = require('nedb')
  var db = new Datastore()

  return {
    getHash: function (credentials, callback) {
      db.find({ uuid: credentials.uuid, type: credentials.type }, function (err, users) {
        var user = users[0]
        if (err || !user) {
          return callback(err, false)
        }
        callback(err, user.hash)
      })
    },
    create: function (credentials, hash, callback) {
      var user = {
        type: credentials.type,
        uuid: credentials.uuid,
        hash: hash
      }
      db.insert(user, function (err, newUser) {
        callback(err, newUser)
      })
    },
    destroy: function (credentials, callback) {
      db.remove({ uuid: credentials.uuid, type: credentials.type }, function (err, removedUser) {
        callback(err)
      })
    }
  }
}
