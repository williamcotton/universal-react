const connection = process.env.BOOKSHELF_MODELS

const knexConfig = {
  connection,
  client: 'pg',
  debug: false
}

console.log(knexConfig)

knexConfig.migrations = {
  directory: __dirname + '/migrations'
}

module.exports = {
  development: knexConfig,
  production: knexConfig
}
