import { Browser } from 'puppeteer-core';
import { Scraper } from './scraper';
import { Product } from '../data/types';
import { setTimeout } from 'node:timers/promises';

const MARKETPLACE = 'АТБ';
const SITE_URL = 'https://www.atbmarket.com/catalog';

export class AtbScraper extends Scraper {
  public scrap = async (browser: Browser, route: string): Promise<Product[]> => {
    const url = `${SITE_URL}/${route}`;
    const page = await browser.newPage();
    await page.setCookie({
      name: 'birthday',
      value: 'true',
      domain: '.www.atbmarket.com',
    });
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36');
      await page.goto(url, { timeout: this.timeout });
      await setTimeout(5000);
      const parsedData = await page.evaluate((marketplace: string) => {
        const products:Product[] =[];
        const elements = document.querySelectorAll<HTMLElement>('.catalog-item');
        for (const e of elements) {
          if (!e) {
            console.log('Element not found');
            continue;
          }
          const pricesBloc = e?.querySelector<HTMLElement>('.catalog-item__bottom');
          const currentPrice = pricesBloc.querySelector<HTMLElement>('.product-price__top')?.innerText;
          const oldPriceElement = pricesBloc.querySelector<HTMLElement>('.product-price__bottom');
          const oldPrice = oldPriceElement?.innerText ?? null;

          const titleElement = e?.querySelector<HTMLElement>('.catalog-item__title');
          if (!titleElement) {
            continue;
          }
          const title = titleElement.innerText;

          const imgElement = e?.querySelector<HTMLElement>('.catalog-item__img');
          const imgSrc = imgElement?.getAttribute('src');
          products.push({ marketplace, title, currentPrice, oldPrice, imgSrc, volume: null });
        }
        return products;
      }, MARKETPLACE);
      return this.filterDuplicateProducts(parsedData);
    } catch (e) {
      throw Error('Scraping failed in ' + MARKETPLACE + ' ' + e);
      return [];
    } finally {
      await page.close();
    }
  };
}
