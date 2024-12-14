import { Browser } from 'puppeteer-core';
import { Scraper } from './scraper';

export class ATBScraper extends Scraper {
  private MARKETPLACE = 'ATB';
  private URL = 'https://www.atbmarket.com/catalog/364-yenergetichni';

  public scrap = async (browser: Browser): Promise<Product[]> => {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36');
    await page.goto(this.URL);
    const marketplace = this.MARKETPLACE;
    await this.wait(3000);
    const parsedData = await page.evaluate((marketplace: string) => {
      const products:Product[] =[];
      const elements = document.querySelectorAll('.catalog-item');
      for (const e of elements) {
        const pricesBloc = e.querySelector('.catalog-item__bottom') as HTMLElement;
        const currentPrice = (pricesBloc.querySelector('.product-price__top') as HTMLElement).innerText;
        const oldPriceElement = pricesBloc.querySelector('.product-price__bottom') as HTMLElement;
        let oldPrice = null; // подумай нужно ли оно с налл
        if (oldPriceElement != null) {
          oldPrice = oldPriceElement.innerText;
        }
        const titleElement = e.querySelector('.catalog-item__title') as HTMLElement;
        let title = 'err: title not found';
        title = titleElement.innerText;

        const imgElement = e.querySelector('.catalog-item__img') as HTMLElement;
        const imgSrc = imgElement.getAttribute('src') ?? null;
        products.push({ marketplace, title, currentPrice, oldPrice, imgSrc, volume: null });
      }
      return products;
    }, marketplace);
    await page.close();
    return this.filterDuplicateProducts(parsedData);
  };
}
