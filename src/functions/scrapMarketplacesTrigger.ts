import { app, InvocationContext, Timer } from '@azure/functions';
import { ScrapingService } from '../services/scrapingService';
import { DataService } from '../services/dataService';

const MARKETPLACES = ['ATB', 'Фора', 'Сільпо', 'Новус'];

export async function scrapMarketplacesTrigger (myTimer: Timer, context: InvocationContext): Promise<void> {
  const scraper = new ScrapingService();
  const dataService = new DataService();
  const scrapedData = await scraper.scrapMarketplaces();
  const data = dataService.filterAndTransformData(scrapedData, MARKETPLACES);
  await dataService.saveData(data);
}

app.timer('scrapMarketplacesTrigger', {
  schedule: '0 * * * *',
  // schedule: '0 */5 * * * *',
  // schedule: '0 * * * * *',
  handler: scrapMarketplacesTrigger,
});
