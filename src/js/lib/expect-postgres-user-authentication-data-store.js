/*

CREATE TABLE accounts (
  uuid            uuid PRIMARY KEY UNIQUE,
  quick_code      VARCHAR(64) UNIQUE,
  public_address  VARCHAR(34),
  created_at      timestamptz,
  updated_at      timestamptz
);

CREATE TABLE wallets (
  blockchain_provider_type  VARCHAR(32),
  identity_provider_type    VARCHAR(32),
  created_at      timestamptz,
  updated_at      timestamptz,
  identity_uuid   VARCHAR(256),
  is_public       boolean,
  address         VARCHAR(34),
  account_uuid    uuid
);

CREATE INDEX accounts_uuid_index ON accounts (uuid);
CREATE INDEX accounts_quick_code_index ON accounts (quick_code);
CREATE INDEX accounts_public_address_index ON accounts (public_address);
CREATE INDEX wallets_address_index ON wallets (address);
CREATE INDEX wallets_account_uuid_index ON wallets (account_uuid);
CREATE INDEX wallets_identity_uuid_index ON wallets (identity_uuid);

*/

/*

var createUUID = require("node-uuid");

var uuid = createUUID.v4();
    var createdAt = (new Date).toISOString();

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
