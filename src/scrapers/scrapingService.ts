import { Browser } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';
import { AtbScraper } from './atbScraper';
import { ForaScraper } from './foraScraper';
import { SilpoScraper } from './silpoScraper';
import { NovusScraper } from './novusScraper';
import { Product } from '../data/types';

export const SCRAPING_CATEGORIES = [
  {
    name: 'energy-drinks',
    abtRoute: '364-yenergetichni',
    foraRoute: 'energetychni-napoi-2486',
    novusRoute: 'energy-drinks',
    silpoRoute: 'energetychni-napoi-59',
  },
  {
    name: 'alcohol',
    abtRoute: '292-alkogol-i-tyutyun',
    foraRoute: 'alkogol-2451',
    novusRoute: 'eighteen-plus',
    silpoRoute: 'alkogol-22',
  },
  {
    name: 'pelmeni',
    abtRoute: '356-vareniki-pel-meni-mlintsi',
    foraRoute: 'pelmeni-varenyky-ta-inshi-vidvarni-vyroby-zamorozheni-2694',
    novusRoute: 'meat-dumplings',
    silpoRoute: 'pelmeni-5170',
  },
  {
    name: 'soda-drinks',
    abtRoute: '307-napoi',
    foraRoute: 'solodka-voda-2483',
    novusRoute: 'soft-drinks',
    silpoRoute: 'solodka-voda-56',
  },
];

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
    ],
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\Chrome.exe',
    // executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  });
};

export const scrapMarketplaces = async (): Promise<ScrapedData> => {
  const browser = await createBrowser();
  const atbScraper = new AtbScraper();
  const foraScraper = new ForaScraper();
  const silpoScraper = new SilpoScraper();
  const novusScraper = new NovusScraper();

  try {
    const scrapedData: ScrapedData = {};
    for (const category of SCRAPING_CATEGORIES) {
      const productArray: Product[] = [];
      productArray.push(...await atbScraper.scrap(browser, category.abtRoute));
      productArray.push(...await foraScraper.scrap(browser, category.foraRoute));
      productArray.push(...await silpoScraper.scrap(browser, category.silpoRoute));
      productArray.push(...await novusScraper.scrap(browser, category.novusRoute));
      scrapedData[category.name] = productArray;
      console.log('Scraped category: ' + category.name);
    }
    return scrapedData;
  } catch (e) {
    console.log('Scraping failed ' + e);
    return {};
  } finally {
    await browser.close();
  }
};

export interface ScrapedData {
  [key: string]: Product[];
}
