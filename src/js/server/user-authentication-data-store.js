module.exports = function (options) {
  var Datastore = require('nedb')
  var db = new Datastore()

  return {
    getHash: function (email, callback) {
      db.find({ email: email }, function (err, users) {
        var user = users[0]
        if (err || !user) {
          return callback(true, false)
        }
        callback(err, user.hash)
      })
    },
    create: function (email, hash, callback) {
      var user = {
        email: email,
        hash: hash
      }
      db.insert(user, function (err, newUser) {
        callback(false, newUser)
      })
    },
    destroy: function (email, callback) {
      db.remove({ email: email }, function (err, removedUser) {
        callback(err)
      })
    }
  }
}
