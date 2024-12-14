import { Browser } from 'puppeteer-core';
import { Scraper } from './scraper';

export class SilpoScraper extends Scraper {
  private URL = 'https://silpo.ua/category/energetychni-napoi-59';
  private MARKETPLACE = 'Сільпо';

  public scrap = async (browser: Browser): Promise<Product[]> => {
    const page = await browser.newPage();
    await page.goto(this.URL);
    await this.wait(4000);
    await page.click('body > sf-shop-silpo-root > shop-silpo-root-shell > silpo-shell-main > div > div.main__body > silpo-category > silpo-catalog > div > div.container.catalog__products > div > ecomui-pagination > div > button > div');
    await this.wait(2000);
    const marketplace = this.MARKETPLACE;
    const parsedData: Product[] = await page.evaluate((marketplace) => {
      const products: Product[] = [];
      const elements = document.querySelectorAll('.ng-star-inserted');
      for (const e of elements) {
        const currentPriceElement = e.querySelector('.ft-whitespace-nowrap') as HTMLElement;
        if (currentPriceElement == null) {
          continue;
        }
        const currentPrice = currentPriceElement.innerText;
        const oldPriceElement = e.querySelector('.ft-line-through') as HTMLElement;
        let oldPrice = null; // подумай нужно ли оно с налл
        if (oldPriceElement != null) {
          oldPrice = oldPriceElement.innerText;
        }
        const titleElement = e.querySelector('.product-card__title') as HTMLElement;
        if (titleElement == null) {
          continue;
        }
        const title:string = titleElement.innerText;

        const imgElement = e.querySelector('.product-card__top-inner') as HTMLElement;
        const imgSrc = (imgElement?.firstChild as HTMLElement)?.getAttribute('src');
        // addProduct(products,{marketplace,title ,currentPrice, oldPrice,imgSrc, volume: null});
        products.push({ marketplace, title, currentPrice, oldPrice, imgSrc, volume: null });
      }
      return products;
    }, marketplace);
    await page.close();
    return this.filterDuplicateProducts(parsedData);
  };

}
