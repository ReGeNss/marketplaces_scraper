import { Browser } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';
import { AtbScraper } from './scrapers/atbScraper';
import { ForaScraper } from './scrapers/foraScraper';
import { SilpoScraper } from './scrapers/silpoScraper';
import { TrashScraper } from './scrapers/trashScraper';
import { NovusScraper } from './scrapers/novusScraper';

export class ScrapingService {
  private createBrowser = async (): Promise<Browser> => {
    return await puppeteer.launch({
      headless: true,
      args: ['--window-size=1920,1080', '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\Chrome.exe',
      // executablePath: './chrome-linux/chrome',
    });
  };

  public scrapMarketplaces = async (): Promise<Product[]> => {
    const productArray: Product[] = [];
    const browser = await this.createBrowser();

    const atbScraper = new AtbScraper();
    const foraScraper = new ForaScraper();
    const silpoScraper = new SilpoScraper();
    const novusScraper = new NovusScraper();
    // const trashScraper = new TrashScraper();

    productArray.push(...await atbScraper.scrap(browser));
    productArray.push(...await foraScraper.scrap(browser));
    productArray.push(...await silpoScraper.scrap(browser));
    // productArray.push(... await trashScraper.scrap(browser));
    productArray.push(...await novusScraper.scrap(browser));
    return productArray;
  };

}

