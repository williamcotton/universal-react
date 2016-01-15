module.exports = function (options) {
  var pgClient = options.pgClient

  return {
    getHash: function (credentials, callback) {
      pgClient.query('SELECT * FROM users WHERE uuid = $1 AND type = $2', [credentials.uuid, credentials.type], function (err, result) {
        if (result && result.rowCount) {
          var row = result.rows[0]
          var hash = row.hash
          callback(err, hash)
        }
      })
    },
    create: function (credentials, hash, callback) {
      var user = {
        type: credentials.type,
        uuid: credentials.uuid,
        hash: hash
      }
      pgClient.query('INSERT INTO users (type, hash, uuid) VALUES ($1,$2,$3)', [user.type, user.hash, user.uuid], function (err, result) {
        callback(err, user)
      })
    },
    destroy: function (credentials, callback) {
      // db.remove({ uuid: credentials.uuid, type: credentials.type }, function (err, removedUser) {
      //   callback(err)
      // })
    },
    setup: function (callback) {
      pgClient.query('CREATE TABLE users (id serial, type varchar(40), hash varchar(256), uuid varchar(256))', callback)
    }
  }
}
