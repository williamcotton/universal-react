/*

CREATE TABLE accounts (
  uuid            uuid PRIMARY KEY UNIQUE,
  quick_code      VARCHAR(64) UNIQUE,
  public_address  VARCHAR(34),
  created_at      timestamptz,
  updated_at      timestamptz
)

CREATE TABLE wallets (
  blockchain_provider_type  VARCHAR(32),
  identity_provider_type    VARCHAR(32),
  created_at      timestamptz,
  updated_at      timestamptz,
  identity_uuid   VARCHAR(256),
  is_public       boolean,
  address         VARCHAR(34),
  account_uuid    uuid
)

CREATE TABLE email_auth_accounts (
  uuid            VARCHAR(254) UNIQUE,
  salt            VARCHAR(64),
  peppered_hash   VARCHAR(256),
  verified        boolean DEFAULT false,
  verified_at     timestamptz,
  created_at      timestamptz,
  updated_at      timestamptz   
)

CREATE UNIQUE INDEX email_auth_accounts_uuid_index ON email_auth_accounts ((lower(uuid)))

CREATE INDEX accounts_uuid_index ON accounts (uuid)
CREATE INDEX accounts_quick_code_index ON accounts (quick_code)
CREATE INDEX accounts_public_address_index ON accounts (public_address)
CREATE INDEX wallets_address_index ON wallets (address)
CREATE INDEX wallets_account_uuid_index ON wallets (account_uuid)
CREATE INDEX wallets_identity_uuid_index ON wallets (identity_uuid)

default timestamp:

CREATE TABLE users (
  id serial not null,
  firstname varchar(100),
  middlename varchar(100),
  lastname varchar(100),
  email varchar(200),
  timestamp timestamp default current_timestamp
)

*/

/*

var createUUID = require("node-uuid")

var uuid = createUUID.v4()
    var createdAt = (new Date).toISOString()

*/

// users table and a user_credentials table? user.uuid = "xxx-xxx-xxxx-xxx", user_credentials.type, user_credentials.uuid, user_credentials.user_uuid

// user_oauths table?

/* 

user_credentials:
  identity anchor (email, phone)
  password hash
  verification status (did they prove they have access to email or phone?)
  user_uuid

  facebook oauth as an identity anchor...
    no password hash, checks signed token... token verifies that facebook says this ID is correct

  email as an identity anchor...
    take a password and match it to the db

  what do we store for facebook? type:'facebook', uuid:'facebook id'

  how do we verify facebook? get a token, verify it was signed by facebook, verify the facebook id matches the credentials

*/

var createUUID = require('node-uuid')

module.exports = function (options) {
  var pgClient = options.pgClient

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
      if (!options.hash) {
        callback(true, false)
      }
      pgClient.query('UPDATE user_credentials SET (hash) = ($1) WHERE uuid = $2', [options.hash, options.uuid], function (err, result) {
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
