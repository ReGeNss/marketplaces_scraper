import { app, InvocationContext, Timer } from '@azure/functions';
import { scrapMarketplaces } from '../scrapers/scrapingService';
import dataParser from '../data/dataParser';
import { saveData } from '../data/dataRepository';
import * as fs from 'node:fs';
import * as path from 'node:path';

const configFilePath = path.resolve(__dirname, '../config.json');
const configurationJson = fs.readFileSync(configFilePath, 'utf8');
const { marketplaces, schedule } = JSON.parse(configurationJson);

export async function scrapMarketplacesTrigger (myTimer: Timer, context: InvocationContext): Promise<void> {
  const scrapedData = await scrapMarketplaces();
  const data = dataParser(scrapedData, marketplaces);
  await saveData(data);
}

app.timer('scrapMarketplacesTrigger', {
  schedule: schedule,
  handler: scrapMarketplacesTrigger,
});
