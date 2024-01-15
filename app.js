/* eslint-disable import/extensions */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  createTable,
  removeNews,
  getNews,
  queryDb,
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

// Initiate database
createTable();
await removeNews();
await getNews();

// Get news for web
app.get('/', async (req, res) => {
  const getNewsFromDb = await queryDb(`
    SELECT * FROM news;
  `);
  return res.json(getNewsFromDb);
});

// Manually get news
app.get('/getNews', async (req, res) => {
  await getNews();
  return res.redirect('/');
});

// Remove old news
app.delete('/deleteNews', async (req, res) => {
  await removeNews();
  return res.redirect('/');
});

app.listen(PORT, (err) => {
  if (err) return console.log(err);
  return console.log(`Listening to PORT: ${PORT}`);
});
