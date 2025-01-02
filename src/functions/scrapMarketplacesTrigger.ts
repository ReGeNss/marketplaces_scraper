import { app, InvocationContext, Timer } from '@azure/functions';
import { scrapMarketplaces } from '../scrapers/scrapingService';
import dataParser from '../data/dataParser';
import { saveData } from '../data/dataRepository';

const MARKETPLACES = ['ATB', 'Фора', 'Сільпо', 'Новус'];

export async function scrapMarketplacesTrigger (myTimer: Timer, context: InvocationContext): Promise<void> {
  const scrapedData = await scrapMarketplaces();
  const data = dataParser(scrapedData, MARKETPLACES);
  await saveData(data);
}

app.timer('scrapMarketplacesTrigger', {
  schedule: '0 * * * *',
  // schedule: '0 */5 * * * *',
  // schedule: '0 * * * * *',
  handler: scrapMarketplacesTrigger,
});
