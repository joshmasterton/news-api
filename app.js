/* eslint-disable import/extensions */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  createTable, getNews, queryDb,
} from './database.js';

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: 'env/.env.production' });
}
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: './.env.development' });
}

const app = express();
const { PORT } = process.env;

app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

createTable();
getNews();

app.get('/', async (req, res) => {
  const getNewsFromDb = await queryDb(`
    SELECT * FROM news;
  `);
  return res.json(getNewsFromDb);
});

app.get('/getNews', async (req, res) => {
  await getNews();
  return res.redirect('/');
});

app.listen(PORT, (err) => {
  if (err) return console.log(err);
  return console.log(`Listening to PORT: '${PORT}`);
});
