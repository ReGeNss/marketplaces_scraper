import { Browser } from 'puppeteer-core';
import { Scraper } from './scraper';

export class ForaScraper extends Scraper {
  private URL = 'https://fora.ua/category/energetychni-napoi-2486';
  private MARKETPLACE = 'Фора';

  public scrap = async (browser: Browser): Promise<Product[]> => {
    const page = await browser.newPage();
    await page.goto(this.URL);
    await this.wait(2000);
    const marketplace = this.MARKETPLACE;
    const parsedData = await page.evaluate((marketplace: string) => {
      const products:Product[] = [];
      const elements = document.querySelectorAll('.product-list-item');
      for (const e of elements) {
        const pricesBloc = e.querySelector('.product-price-container') as HTMLElement;
        if (pricesBloc == null) {
          console.log('pricesBloc is null');
          continue;
        }
        const currentPriceInt = (pricesBloc.querySelector('.current-integer') as HTMLElement).innerText;
        const currentPriceFractionElement = pricesBloc.querySelector('.current-fraction') as HTMLElement;
        // if(currentPriceFractionElement == null){continue;}
        const currentPriceFraction = currentPriceFractionElement.innerText ;
        const currentPrice = currentPriceInt + '.' + currentPriceFraction;

        const oldPriceElement = pricesBloc.querySelector('.old-integer') as HTMLElement;
        let oldPrice = null; // подумай нужно ли оно с налл
        if (oldPriceElement != null) {
          oldPrice = oldPriceElement.innerText;
        }
        const titleElement = e.querySelector('.product-title') as HTMLElement;
        const title = titleElement.innerText;

        const imgElement = e.querySelector('.product-list-item__image') as HTMLElement;
        const imgSrc = imgElement.getAttribute('src');
        products.push({ marketplace, title, currentPrice, oldPrice, imgSrc, volume: null });
      }
      return products;
    }, marketplace);
    await page.close();
    return this.filterDuplicateProducts(parsedData);
  };

}
