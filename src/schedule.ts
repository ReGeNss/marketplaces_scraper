import { scheduleJob } from 'node-schedule';
import scrapMarketplacesTrigger from './scrapMarketplacesTrigger';

export default function startSchedule () {
  const job = scheduleJob('0 */12 * * *', async () => {
    console.log('start schedule scraping');
    try {
      await scrapMarketplacesTrigger();
      console.log('scrapped by schedule');
    } catch (e) {
      console.log('Scraping failed ' + e);
    }
  });
}
