import { app } from '@azure/functions';
import * as dotenv from 'dotenv';
import { ScrapingService } from './scrapers/scrapingService';
import DataParser from './data/dataParser';
import * as fs from 'node:fs';

dotenv.config();
// app.setup({
// enableHttpStream: true,
// });
(async () => {
  const a = await new ScrapingService().scrapMarketplaces();
  const b = DataParser(a, ['ATB', 'Фора', 'Сільпо', 'Новус']);
  fs.writeFileSync('output.json', JSON.stringify(b));
})();
