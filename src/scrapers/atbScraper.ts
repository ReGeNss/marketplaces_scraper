import { Browser } from 'puppeteer-core';
import { Scraper } from './scraper';
import { Product } from '../data/types';
import { setTimeout } from 'node:timers/promises';

const MARKETPLACE = 'ATB';
const URL = 'https://www.atbmarket.com/catalog/364-yenergetichni';
const THREE_SECONDS = 3000;

export class AtbScraper extends Scraper {
  public scrap = async (browser: Browser): Promise<Product[]> => {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36');
    await page.goto(URL);
    await setTimeout(THREE_SECONDS);
    const parsedData = await page.evaluate((marketplace: string) => {
      const products:Product[] =[];
      const elements = document.querySelectorAll<HTMLElement>('.catalog-item');
      for (const e of elements) {
        const pricesBloc = e.querySelector<HTMLElement>('.catalog-item__bottom');
        const currentPrice = pricesBloc.querySelector<HTMLElement>('.product-price__top')?.innerText;
        const oldPriceElement = pricesBloc.querySelector<HTMLElement>('.product-price__bottom');
        const oldPrice = oldPriceElement?.innerText ?? null;

        const titleElement = e.querySelector<HTMLElement>('.catalog-item__title');
        if (!titleElement) {
          continue;
        }
        const title = titleElement.innerText;

        const imgElement = e.querySelector<HTMLElement>('.catalog-item__img');
        const imgSrc = imgElement?.getAttribute('src');
        products.push({ marketplace, title, currentPrice, oldPrice, imgSrc, volume: null });
      }
      return products;
    }, MARKETPLACE);
    await page.close();
    return this.filterDuplicateProducts(parsedData);
  };
}
