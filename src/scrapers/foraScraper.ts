import { Browser } from 'puppeteer-core';
import { Scraper } from './scraper';
import { Product } from '../data/types';
import { setTimeout } from 'node:timers/promises';

const SITE_URL = 'https://fora.ua/category';
const MARKETPLACE = 'Фора';
const ONE_MINUTE = 60000;

export class ForaScraper extends Scraper {
  public scrap = async (browser: Browser, route: string): Promise<Product[]> => {
    const url = `${SITE_URL}/${route}`;
    const page = await browser.newPage();
    try {
      await page.goto(url, { timeout: this.timeout });
      await setTimeout(ONE_MINUTE);
      const parsedData = await page.evaluate((marketplace: string) => {
        const products:Product[] = [];
        const elements = document.querySelectorAll<HTMLElement>('.product-list-item');
        for (const e of elements) {
          if (!e) continue;
          const pricesBloc = e.querySelector<HTMLElement>('.product-price-container');
          if (!pricesBloc) {
            continue;
          }
          const currentPriceInt = pricesBloc.querySelector<HTMLElement>('.current-integer').innerText;
          const currentPriceFractionElement = pricesBloc.querySelector<HTMLElement>('.current-fraction');
          const currentPriceFraction = currentPriceFractionElement?.innerText ;
          const currentPrice = currentPriceInt + '.' + currentPriceFraction;

          const oldPriceElement = pricesBloc.querySelector<HTMLElement>('.old-integer');
          const oldPrice = oldPriceElement?.innerText ?? null;

          const titleElement = e.querySelector<HTMLElement>('.product-title');
          if (!titleElement) {
            continue;
          }
          const title = titleElement.innerText;

          const imgElement = e.querySelector<HTMLElement>('.product-list-item__image');
          const imgSrc = imgElement.getAttribute('src');
          products.push({ marketplace, title, currentPrice, oldPrice, imgSrc, volume: null });
        }
        return products;
      }, MARKETPLACE);
      return this.filterDuplicateProducts(parsedData);
    } catch (e) {
      console.log('Scraping failed in ' + MARKETPLACE + ' ' + e);
      return [];
    } finally {
      await page.close();
    }
  };
}
