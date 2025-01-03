import { Browser } from 'puppeteer-core';
import { Scraper } from './scraper';
import { Product } from '../data/types';

const URL = 'https://novus.zakaz.ua/uk/categories/energy-drinks/';
const MARKETPLACE = 'Новус';
const FOUR_SECONDS = 4000;
const PAGEDOWN_COUNT = 2;

export class NovusScraper extends Scraper {
  public scrap = async (browser: Browser): Promise<Product[]> => {
    const page = await browser.newPage();
    await page.goto(URL);
    await this.wait(FOUR_SECONDS);
    for (let i = 0 ; i < PAGEDOWN_COUNT ; i++) {
      await page.click('#PageWrapBody_desktopMode > div.jsx-e14abeb0dec5e794.CategoryProductBox__loadMore > button');
      await this.wait(4000);
    }
    const parsedData: Product[] = await page.evaluate((marketplace) => {
      const products: Product[] = [];
      const elements = document.querySelectorAll('.ProductsBox__listItem');
      for (const e of elements) {
        const currentPriceElement = e.querySelector('.Price__value_caption') as HTMLElement;
        if (!currentPriceElement) {
          continue;
        }
        const currentPrice = currentPriceElement.innerText;
        const oldPriceElement = e.querySelector('.Price__value_body') as HTMLElement;
        let oldPrice = null;
        if (oldPriceElement) {
          oldPrice = oldPriceElement.innerText;
        }
        const titleElement = e.querySelector('.ProductTile__title') as HTMLElement;
        if (!titleElement) {
          continue;
        }
        const title = titleElement.innerText;

        const imgElement = e.querySelector('.ProductTile__imageContainer') as HTMLElement;
        const imgSrc = (imgElement?.firstChild as HTMLElement)?.getAttribute('src');
        products.push({ marketplace, title, currentPrice, oldPrice, imgSrc, volume: null });

      }
      return products;
    }, MARKETPLACE);
    await page.close();
    return this.filterDuplicateProducts(parsedData);
  };
}
