import { Browser } from 'puppeteer-core';
import { Scraper } from './scraper';
import { Product } from '../data/types';
import { setTimeout } from 'node:timers/promises';

const URL = 'https://silpo.ua/category/energetychni-napoi-59';
const MARKETPLACE = 'Сільпо';
const FOUR_SECONDS = 4000;
const TWO_SECONDS = 2000;

export class SilpoScraper extends Scraper {
  public scrap = async (browser: Browser): Promise<Product[]> => {
    const page = await browser.newPage();
    await page.goto(URL);
    await setTimeout(FOUR_SECONDS);
    await page.click('body > sf-shop-silpo-root > shop-silpo-root-shell > silpo-shell-main > div > div.main__body > silpo-category > silpo-catalog > div > div.container.catalog__products > div > ecomui-pagination > div > button > div');
    await setTimeout(TWO_SECONDS);
    const parsedData: Product[] = await page.evaluate((marketplace) => {
      const products: Product[] = [];
      const elements = document.querySelectorAll<HTMLElement>('.ng-star-inserted');
      for (const e of elements) {
        const currentPriceElement = e.querySelector<HTMLElement>('.ft-whitespace-nowrap');
        if (currentPriceElement == null) {
          continue;
        }
        const currentPrice = currentPriceElement?.innerText;
        const oldPriceElement = e.querySelector<HTMLElement>('.ft-line-through');
        const oldPrice = oldPriceElement?.innerText ?? null;

        const titleElement = e.querySelector<HTMLElement>('.product-card__title');
        if (!titleElement) {
          continue;
        }
        const title = titleElement.innerText;

        const imgElement = e.querySelector<HTMLElement>('.product-card__top-inner');
        const imgSrc = (imgElement?.firstChild as HTMLElement)?.getAttribute('src');
        products.push({ marketplace, title, currentPrice, oldPrice, imgSrc, volume: null });
      }
      return products;
    }, MARKETPLACE);
    await page.close();
    return this.filterDuplicateProducts(parsedData);
  };

}
