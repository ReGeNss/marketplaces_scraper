import { Browser } from 'puppeteer-core';
import { Scraper } from './scraper';

export class NovusScraper extends Scraper {
  private URL = 'https://novus.zakaz.ua/uk/categories/energy-drinks/';
  private MARKETPLACE = 'Новус';

  public scrap = async (browser: Browser): Promise<Product[]> => {
    const page = await browser.newPage();
    await page.goto(this.URL);
    await this.wait(4000);
    for (let i =0 ; i < 2 ; i++) {
      await page.click('#PageWrapBody_desktopMode > div.jsx-e14abeb0dec5e794.CategoryProductBox__loadMore > button');
      await this.wait(4000);
    }
    const marketplace = this.MARKETPLACE;
    const parsedData: Product[] = await page.evaluate((marketplace) => {
      const products: Product[] = [];
      const elements = document.querySelectorAll('.ProductsBox__listItem');
      for (const e of elements) {
        const currentPriceElement = e.querySelector('.Price__value_caption') as HTMLElement;
        if (currentPriceElement == null) {
          continue;
        }
        const currentPrice = currentPriceElement.innerText;
        const oldPriceElement = e.querySelector('.Price__value_body') as HTMLElement;
        let oldPrice =null;
        if (oldPriceElement !== null) {
          oldPrice = oldPriceElement.innerText;
        }
        const titleElement = e.querySelector('.ProductTile__title') as HTMLElement;
        if (titleElement == null) {
          continue;
        }
        const title:string = titleElement.innerText;

        const imgElement = e.querySelector('.ProductTile__imageContainer') as HTMLElement;
        const imgSrc = (imgElement?.firstChild as HTMLElement)?.getAttribute('src');
        products.push({ marketplace, title, currentPrice, oldPrice, imgSrc, volume: null });

      }
      return products;
    }, marketplace);
    await page.close();
    return this.filterDuplicateProducts(parsedData);
  };
}
