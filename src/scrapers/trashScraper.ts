import { Browser } from 'puppeteer-core';
import { Scraper } from './scraper';
import { Product } from '../data/types';

const URL = 'https://thrash.ua/promotions';
const MARKETPLACE = 'Траш';

export class TrashScraper extends Scraper {
  public scrap = async (browser: Browser): Promise<Product[]> => {
    const page = await browser.newPage();
    await page.goto(URL);
    await this.wait(2000);
    const parsedData: Product[] = await page.evaluate((marketplace: string) => {
      const products: Product[] = [];
      const elements = document.querySelectorAll('.normal');
      for (const e of elements) {
        const currentPriceInteger = (e.querySelector('.current-integer') as HTMLElement).innerText;
        const currentPriceFraction = (e.querySelector('.current-fraction') as HTMLElement).innerText;

        const oldPriceInteger = (e.querySelector('.old-integer') as HTMLElement).innerText;
        const oldPriceFraction = (e.querySelector('.old-fraction') as HTMLElement).innerText;

        const currentPrice = currentPriceInteger + '.' + currentPriceFraction;
        const oldPrice = oldPriceInteger + '.' + oldPriceFraction;

        const titleElement = e.querySelector('.product-title') as HTMLElement;
        const title = titleElement.innerText;

        const imgElement = e.querySelector('.product-img') as HTMLElement;
        const imgSrc = imgElement.getAttribute('src');
        products.push({ marketplace, title, currentPrice, oldPrice, imgSrc, volume: null });
      }
      return products;
    }, MARKETPLACE);
    await page.close();
    return this.filterDuplicateProducts(parsedData);
  };
}
