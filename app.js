/* eslint-disable import/extensions */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  createDatabase,
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

// createDatabase();
// getNews();

app.get('/', async (req, res) => {
  try {
    const fetchNews = await queryDb('SELECT * FROM news');
    return res.json(fetchNews);
  } catch (err) {
    return res.json({ err: err.message });
  }
});
app.listen(PORT, (err) => {
  if (err) return console.log(err);
  return console.log(`Listening to PORT: ${PORT}`);
});
