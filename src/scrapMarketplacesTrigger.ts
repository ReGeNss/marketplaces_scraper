import { scrapMarketplaces } from './scrapers/scrapingService';
import dataParser from './data/dataParser';
import { saveData } from './data/dataRepository';
import { FormattedData } from './data/types';

const marketplaces = ['АТБ', 'Фора', 'Сільпо', 'Новус'];

export default async function scrapMarketplacesTrigger (): Promise<FormattedData> {
  const scrapedData = await scrapMarketplaces();
  const formattedData: FormattedData = {};
  for (const category in scrapedData) {
    formattedData[category] = dataParser(scrapedData[category], marketplaces);
  }
  await saveData(formattedData);
  let amount = 0;
  for (const category in formattedData) {
    const brands = formattedData[category].brands;
    for (const brand in brands) {
      amount+= brands[brand].length;
    }
  }
  console.log('SCRAPED: ', amount);
  return formattedData;
}
