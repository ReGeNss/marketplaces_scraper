import * as express from 'express';
import { getData } from './data/dataRepository';
import scrapMarketplacesTrigger from './scrapMarketplacesTrigger';

export default function startServer () {
  const app = express();

  app.get('/', async (req, res) => {
    const data = await getData();
    const dataJson = JSON.stringify(data);
    res.setHeader('Content-Type', 'application/json');
    res.send(dataJson);
  });

  app.post('/scrap', async (req, res) => {
    console.log('start');
    try {
      const data = await scrapMarketplacesTrigger();
      res.status(201).setHeader('Content-Type', 'application/json').send(JSON.stringify(data));
    } catch (e) {
      res.status(500).send('Scraping failed: ' + e);
    }
    console.log('scrapped');
  });

  app.listen(process.env.PORT, () => {
    console.log('Server is running on port ' + process.env.PORT);
  });
}

