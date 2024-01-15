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
  DATABASE_URL,
} = process.env;

export const queryDb = async (query) => {
  try {
    const client = new Client({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      connectionString: DATABASE_URL,
    });
    await client.connect();
    const queryResult = await client.query(query);
    await client.end();
    // Log details for checks
    console.log(`--${queryResult.command}--`);
    console.log(query.text ?? query);
    return queryResult.rows;
  } catch (err) {
    console.log(err.message);
    return [];
  }
};

// Collect all news
export const getNews = async () => {
  try {
    // Gather latest news from api
    const fetchData = await fetch(process.env.NEWS_API);
    const responseData = await fetchData.json();
    // On every news object store in database
    const promiseMap = responseData.results.map(async (obj) => {
      const articleExists = await queryDb({
        text: `
          SELECT * FROM news 
          WHERE article_id = ($1);
        `,
        values: [`${obj.article_id}`],
      });
      if (articleExists[0]) {
        console.log('Article in database, Continuing process ');
      } else {
        await queryDb({
          text: `
            INSERT INTO news
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
          `,
          values: [
            `${obj?.article_id}`, `${obj?.title}`, `${obj?.link}`,
            `${obj?.content}`, `${obj?.pubDate}`, `${obj?.image_url}`,
            `${obj?.source_id}`, `${obj?.country}`, `${obj?.category}`,
            `${obj?.language}`,
          ],
        });
      }
    });
    return await Promise.all(promiseMap);
  } catch (err) {
    console.log(err.message);
    return [];
  }
};

// Check old news and remove
export const removeNews = async () => {
  try {
    await queryDb({
      text: `
        DELETE FROM news
        WHERE pubDate < $1
      `,
      values: [new Date(new Date().setDate(new Date().getDate() - 3))],
    });
  } catch (err) {
    console.log(err.message);
  }
};

// Build news database table
export const createTable = async () => {
  try {
    // await queryDb(`
    //   DROP TABLE IF EXISTS news;
    // `);
    await queryDb(`
      CREATE TABLE IF NOT EXISTS news(
        article_id VARCHAR(500),
        title VARCHAR(10000),
        link VARCHAR(500),
        content VARCHAR(50000),
        pubDate TIMESTAMP,
        image_url VARCHAR(500),
        source_id VARCHAR(500),
        country VARCHAR(500),
        category VARCHAR(500),
        language VARCHAR(500)
      );
    `);
  } catch (err) {
    console.log(err.message);
  }
};
