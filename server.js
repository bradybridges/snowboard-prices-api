const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const environment = process.env.NOVE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.set('port', process.env.PORT || 3000);
app.locals.title = 'Snowboard Price API';

app.get('/', (request, response) => {
  response.status(200).send('Welcome to the Snowboard Price API');
});

app.get('/api/v1/brands', (request, response) => {
  database('brands')
    .orderBy('name')
    .then((data) => {
      response.status(200).json(data);
    })
    .catch((err) => {
      response.status(500).json({ err });
    });
});

app.get('/api/v1/brands/:name', (request, response) => {
  database('brands')
    .where('name', request.params.name)
    .then((brand) => {
      if(brand.length) {
        return response.status(200).json(brand[0]);
      } else {
        return response.status(404).json({ error: `No brand by name ${request.params.name} found` });
      }
    })
    .catch((err) => response.status(500).json({ err }));
});

app.get('/api/v1/boards', (request, response) => {
  database('boards')
    .orderBy('name')
    .then((boards) => {
      response.status(200).json(boards);
    })
    .catch((err) => response.status(500).json({ err }));
});

app.get('/api/v1/boards/:brand', (request, response) => {
  database('brands')
    .select('boards.name', 'boards.price', 'boards.url')
    .innerJoin('boards', 'brands.brandId', 'boards.brandId')
    .where('brands.name', request.params.brand)
    .then((boards) => {
      if(boards.length) {
        response.status(200).json(boards);
      } else {
        response.status(404).json({ error: `No boards by ${request.params.brand} found`});
      }
    })
    .catch((error) => response.status(500).json( { error }));
});

app.post('/api/v1/boards', (req, resp) => {
  const receivedData = req.body;
  for( let requiredParams of ['brandId', 'name', 'price', 'url']) {
    if(!receivedData[requiredParams]) {
      return resp
        .status(422)
        .send({ error: `Expected { brandId: <Integer>, name: <String>, price: <Double>, url: <String>} Missing ${requiredParams}!`});
    }
  }
  database('boards')
    .insert(receivedData, 'name')
    .then((newBoard) => {
      resp.status(201).json(newBoard);
    })
    .catch((err) => resp.status(500).json({ err }));
});

app.patch('/api/v1/boards', (request, response) => {
  const receivedData = request.body;
  for(let requiredParams of ['name', 'price']) {
    if(!receivedData[requiredParams]) {
      return response
        .status(422)
        .send({ error: `Expected { name: <String>, price: <Double> } Your missing ${requiredParams}!`})
    }
  }
  database('boards')
    .where('name', receivedData.name)
    .update({
      price: receivedData.price
    })
    .then(() => response.status(200).json({ message: `${receivedData.name} changed to $${receivedData.price}`}))
    .catch((err) => response.status(500).json({ err }));
});

app.delete('/api/v1/brands/:brand', (request, response) => {
  database('brands')
    .where('name', request.params.brand)
    .then((brand) => {
      if(!brand.length) {
        return response.status(404).json({ error: `Brand with name ${request.params.brand} not found` });
      }
      database('brands')
        .where('name', request.params.brand)
        .del()
        .then(() => response.status(202).json({ message: `Successfully deleted ${request.params.brand}` }));
    })
    .catch((err) => response.status(500).json({ err }));
});

app.delete('/api/v1/boards/:name', (request, response) => {
  database('boards')
    .where('name', request.params.name)
    .then((board) => {
      if(!board.length) {
        return response.status(404).json({ error: `Board with name ${request.params.name} not found!` });
      }
      database('boards')
        .where('name', request.params.name)
        .del()
        .then(() => response.status(202).json({ message: `Successfully deleted ${request.params.name}:/`}))
    })
    .catch((err) => response.status(500).json({ err }));
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});   