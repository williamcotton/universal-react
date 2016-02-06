#!/usr/bin/env node
const initKnex = require('knex')
const path = require('path')
const fs = require('fs')

const up = (knex) => {
  const filepath = path.join(__dirname, 'postgres-user-authentication-data-store-schema.sql')
  const sql = fs.readFileSync(filepath, 'utf-8')
  return knex.raw(sql)
}

/*
const down = (knex) => {
  return knex.schema.dropTable('user_credentials').then(() => {
    return knex.schema.dropTable('users')
  })
}
*/

const connection = process.env.EXPECT_POSTGRES_USER_AUTHENTICATION_DATA_STORE_URL

const knexConfig = {
  connection,
  client: 'pg',
  debug: false
}

const knex = initKnex(knexConfig)

up(knex).then(() => {
  console.log('migration successful')
  process.exit()
}).catch((err) => console.error(err.stack))
