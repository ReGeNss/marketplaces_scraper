import * as express from 'express';
import { categories, getData } from './data/dataRepository';
import scrapMarketplacesTrigger from './scrapMarketplacesTrigger';

export default function startServer () {
  const app = express();

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

  app.get('/categories', (req, res) => {
    res.status(200).setHeader('Content-Type', 'application/json').send(JSON.stringify(categories));
  });

  app.get('/categories/:category', async (req, res) => {
    const isCategoryExist = categories.some((c) => c.apiRoute === req.params.category);
    if (!isCategoryExist) {
      res.status(404).send('Category not found');
      return;
    }
    const data = await getData(req.params.category);
    res.status(200).setHeader('Content-Type', 'application/json').send(JSON.stringify(data));
  });

  app.listen(process.env.PORT, () => {
    console.log('Server is running on port ' + process.env.PORT);
  });
}

