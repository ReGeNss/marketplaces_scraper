import { scrapMarketplaces } from './scrapers/scrapingService';
import dataParser from './data/dataParser';
import { saveData } from './data/dataRepository';
import { Data } from './data/types';

const marketplaces = ['АТБ', 'Фора', 'Сільпо', 'Новус'];

export default async function scrapMarketplacesTrigger (): Promise<Data> {
  const scrapedData = await scrapMarketplaces();
  const data = dataParser(scrapedData, marketplaces);
  await saveData(data);
  return data;
}
