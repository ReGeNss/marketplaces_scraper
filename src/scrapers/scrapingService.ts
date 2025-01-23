import { Browser } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';
import { AtbScraper } from './atbScraper';
import { ForaScraper } from './foraScraper';
import { SilpoScraper } from './silpoScraper';
// import { TrashScraper } from './trashScraper';
import { NovusScraper } from './novusScraper';
import { Product } from '../data/types';

const createBrowser = async (): Promise<Browser> => {
  return await puppeteer.launch({
    headless: true,
    args: [
      '--window-size=1920,1080',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-software-rasterizer',
      '--window-size=1280,800',
    ],
    // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\Chrome.exe',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  });
};

export const scrapMarketplaces = async (): Promise<Product[]> => {
  const browser = await createBrowser();
  try {
    const productArray: Product[] = [];

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
  } catch (e) {
    console.log('Scraping failed ' + e);
    return [];
  } finally {
    await browser.close();
  }
};

