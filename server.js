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

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});   