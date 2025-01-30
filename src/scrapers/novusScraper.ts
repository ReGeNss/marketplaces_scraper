import { Browser, ElementHandle } from 'puppeteer-core';
import { Scraper } from './scraper';
import { Product } from '../data/types';
import { setTimeout } from 'node:timers/promises';

const SITE_URL = 'https://novus.zakaz.ua/uk/categories';
const MARKETPLACE = 'Новус';
const EIGHT_SECONDS = 8000;
const PAGEDOWN_COUNT = 20;

export class NovusScraper extends Scraper {
  public scrap = async (browser: Browser, route: string): Promise<Product[]> => {
    const url = `${SITE_URL}/${route}`;
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('confirmedAge', 'confirmed');
    });
    try {
      await page.goto(url, { timeout: this.timeout });
      await setTimeout(EIGHT_SECONDS);
      for (let i = 0 ; i < PAGEDOWN_COUNT ; i++) {
        const button =  await page.$('#PageWrapBody_desktopMode > div.jsx-e14abeb0dec5e794.CategoryProductBox__loadMore > button') as ElementHandle<Element>;
        if (!button) {
          break;
        }
        await button.click();
        await setTimeout(EIGHT_SECONDS);
      }
      const parsedData: Product[] = await page.evaluate((marketplace) => {
        const products: Product[] = [];
        const elements = document.querySelectorAll<HTMLElement>('.ProductsBox__listItem');
        for (const e of elements) {
          try {
            if (!e) continue;
            if (e.querySelector<HTMLElement>('.Price__value_unavailable') !== null) continue;
            const currentPriceElement = e.querySelector<HTMLElement>('.Price__value_caption');
            if (!currentPriceElement) {
              continue;
            }
            const currentPrice = currentPriceElement?.innerText;
            const oldPriceElement = e.querySelector<HTMLElement>('.Price__value_body');
            const oldPrice = oldPriceElement?.innerText ?? null;

            const titleElement = e.querySelector<HTMLElement>('.ProductTile__title');
            if (!titleElement) {
              continue;
            }
            const title = titleElement.innerText;

            const imgElement = e.querySelector<HTMLElement>('.ProductTile__imageContainer');
            const imgSrc = (imgElement?.firstChild as HTMLElement)?.getAttribute('src');
            products.push({ marketplace, title, currentPrice, oldPrice, imgSrc, volume: null });
          } catch {
            console.log('Error in Novus scraper. Continue');
            continue;
          }

        }
        return products;
      }, MARKETPLACE);
      return this.filterDuplicateProducts(parsedData);
    } catch (e) {
      console.log('Scraping failed in ' + MARKETPLACE + ' ' + e);
    } finally {
      await page.close();
    }
  };
}
