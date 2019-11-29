
exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable('brands', (table) => {
      table.increments('id').primary();
      table.integer('brandId').unique();
      table.string('name');
      table.string('url');
      table.timestamps(true, true);
    }),
    knex.schema.createTable('boards', (table) => {
      table.integer('brandId').unsigned();
      table.foreign('brandId').onDelete('CASCADE').references('brands.brandId');
      table.string('name');
      table.double('price').unsigned();
      table.string('url');
      table.timestamps(true, true);
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTable('boards'),
    knex.schema.dropTable('brands')
  ]);
};
