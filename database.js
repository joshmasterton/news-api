import pgPkg from 'pg';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: 'env/.env.production' });
}
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: 'env/.env.development' });
}

const { Client } = pgPkg;
const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
} = process.env;

export const queryDb = async (query) => {
  const client = new Client({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
  });
  await client.connect();
  const queryResult = await client.query(query);
  await client.end();
  return queryResult.rows;
};

export const createDatabase = async () => {
  await queryDb(`
    CREATE TABLE IF NOT EXISTS news(
      uuid VARCHAR(100),
      title VARCHAR(500),
      description VARCHAR(500),
      snippet VARCHAR(500),
      url VARCHAR(255),
      image_url VARCHAR(255),
      published_at TIMESTAMPTZ,
      source VARCHAR(255),
      categories VARCHAR(255)
    );
  `);
};

export const getNews = async () => {
  const fetchNews = await fetch(process.env.NEWS_API, {
    method: 'GET',
  });
  const newsResult = await fetchNews.json();
  console.log(newsResult);
  const uploadToDB = await newsResult.data.map(async (obj) => {
    const existingArticle = await queryDb({
      text: 'SELECT * FROM news WHERE uuid = $1',
      values: [obj.uuid],
    });
    if (existingArticle.length === 0) {
      await queryDb({
        text: `
          INSERT INTO news
          VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `,
        values: [
          obj.uuid,
          obj.title,
          obj.description,
          obj.snippet,
          obj.url,
          obj.image_url,
          obj.published_at,
          obj.source,
          obj.categories,
        ],
      });
    }
  });

  await Promise.all(uploadToDB);
};
