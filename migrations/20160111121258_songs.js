exports.up = (knex) => {
  return knex.schema.createTable('songs', (table) => {
    table.string('id').primary()
    table.timestamps()
    table.string('composer')
    table.string('name')
    table.integer('stars')
    table.integer('read_count').default(0)
    table.text('lyrics')
  })
}

exports.down = (knex) => {
  return knex.schema.dropTable('wallets')
}
