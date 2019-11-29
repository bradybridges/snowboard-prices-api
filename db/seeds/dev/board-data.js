const snowboardData = require('../../../priceData');

const createBrands = (knex) => {
  let boardPromises = [];
  snowboardData.forEach((brand) => {
    boardPromises.push(createBrand(knex, brand));
  });
  return Promise.all(boardPromises);
}

const createBrand = (knex, brand) => {
  const { name, url, brandId } = brand;
  return knex('brands').insert({ name, url, brandId });
}

const createBoards = (knex) => {
  let boardPromises = [];
  snowboardData.forEach((brand) => {
    brand.boards.forEach((board) => {
      boardPromises.push(createBoard(knex, board));
    })
  });
  return Promise.all(boardPromises);
}

const createBoard = (knex, board) => {
  const { brandId, name, url } = board;
  const price = board.price.split('$')[1];
  
  return knex('boards').insert({brandId, name, price, url });
};

exports.seed = function(knex) {
  return knex('boards').del()
    .then(() => knex('brands').del())
    .then(() => createBrands(knex))
    .then(() => createBoards(knex))
    .catch((err) => console.log(`Error seeding data: ${err}`));
};
