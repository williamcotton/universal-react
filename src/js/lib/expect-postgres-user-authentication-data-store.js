var createUUID = require('node-uuid')
var pg = require('pg')

module.exports = function (options) {
  var pgClient = {
    query: () => {}
  }
  var connection = options.connection

  pg.connect(connection, function (err, _pgClient, done) {
    pgClient = _pgClient
  })

  return {
    getUserCredentials: function (options, callback) {
      pgClient.query('SELECT * FROM user_credentials WHERE uuid = $1 AND type = $2', [options.uuid, options.type], function (err, result) {
        if (result && result.rowCount) {
          var row = result.rows[0]
          var hash = row.hash
          var type = row.type
          var uuid = row.uuid
          var verified = row.verified
          var user_uuid = row.user_uuid
          callback(err, {
            hash: hash,
            type: type,
            uuid: uuid,
            verified: verified,
            user_uuid: user_uuid
          })
        } else {
          callback(false, {})
        }
      })
    },
    setVerified: function (options, callback) {
      var verified_at = (new Date).toISOString()
      var verified = true
      pgClient.query('UPDATE user_credentials SET (verified, verified_at) = ($1, $2) WHERE uuid = $3', [verified, verified_at, options.uuid], function (err, result) {
        callback(false, verified)
      })
    },
    setHash: function (options, callback) {
      var updated_at = (new Date).toISOString()
      if (!options.hash) {
        callback(true, false)
      }
      pgClient.query('UPDATE user_credentials SET (hash, updated_at) = ($1, $2) WHERE uuid = $3', [options.hash, updated_at, options.uuid], function (err, result) {
        callback(false, options.hash)
      })
    },
    create: function (options, callback) {
      var user_credential = {
        type: options.type,
        uuid: options.uuid,
        hash: options.hash
      }
      var user_uuid = createUUID.v4()
      pgClient.query('INSERT INTO users (uuid) VALUES ($1)', [user_uuid], function (err, result) {
        var user = {
          user_uuid: user_uuid
        }
        pgClient.query('INSERT INTO user_credentials (type, hash, uuid, user_uuid) VALUES ($1,$2,$3,$4)', [user_credential.type, user_credential.hash, user_credential.uuid, user_uuid], function (err, result) {
          user.uuid = user_credential.uuid
          user.type = user_credential.type
          user.verified = false
          user.hash = user_credential.hash
          callback(err, user)
        })
      })
    },
    destroy: function (options, callback) {
      if (!options.user_uuid) {
        callback(true, false)
      }
      pgClient.query('DELETE FROM user_credentials WHERE user_uuid = $1', [options.user_uuid], function (err, result) {
        pgClient.query('DELETE FROM users WHERE uuid = $1', [options.user_uuid], function (err, result) {
          callback(err, !err)
        })
      })
    }
  }
}
