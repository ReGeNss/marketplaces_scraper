import { Browser } from 'puppeteer-core';
import { Scraper } from './scraper';
import { Product } from '../data/types';
import { setTimeout } from 'node:timers/promises';

const URL = 'https://thrash.ua/promotions';
const MARKETPLACE = 'Траш';
const TWO_SECONDS = 2000;

export class TrashScraper extends Scraper {
  public scrap = async (browser: Browser): Promise<Product[]> => {
    const page = await browser.newPage();
    await page.goto(URL);
    await setTimeout(TWO_SECONDS);
    const parsedData: Product[] = await page.evaluate((marketplace: string) => {
      const products: Product[] = [];
      const elements = document.querySelectorAll('.normal');
      for (const e of elements) {
        const currentPriceInteger = e.querySelector<HTMLElement>('.current-integer').innerText;
        const currentPriceFraction = e.querySelector<HTMLElement>('.current-fraction').innerText;

        const oldPriceInteger = e.querySelector<HTMLElement>('.old-integer').innerText;
        const oldPriceFraction = e.querySelector<HTMLElement>('.old-fraction').innerText;

        const currentPrice = currentPriceInteger + '.' + currentPriceFraction;
        const oldPrice = oldPriceInteger + '.' + oldPriceFraction;

        const titleElement = e.querySelector<HTMLElement>('.product-title');
        const title = titleElement.innerText;

        const imgElement = e.querySelector<HTMLElement>('.product-img');
        const imgSrc = imgElement.getAttribute('src');
        products.push({ marketplace, title, currentPrice, oldPrice, imgSrc, volume: null });
      }
      return products;
    }, MARKETPLACE);
    await page.close();
    return this.filterDuplicateProducts(parsedData);
  };
}
