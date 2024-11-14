import {Browser} from "puppeteer-core"
import {Scraper} from "./scraper"

export class ATBScraper extends Scraper{
    private marketplace = "ATB";
    private siteUrl = 'https://www.atbmarket.com/catalog/364-yenergetichni';

    scrap:(browser: Browser)=> Promise<Product[]> = async (browser) => {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36');
        await page.goto(this.siteUrl)
        const marketplace = this.marketplace;
        await this.wait(3000);
        const parsedData:Product[]  = await page.evaluate((marketplace: string) => {
            const products:Product[] =[];
            let elements = document.querySelectorAll('.catalog-item');
            for(let e of elements){
                let pricesBloc = e.querySelector('.catalog-item__bottom') as HTMLElement;
                let currentPrice = (pricesBloc.querySelector('.product-price__top') as HTMLElement).innerText;
                let oldPriceElement = pricesBloc.querySelector('.product-price__bottom') as HTMLElement;
                let oldPrice = null; // подумай нужно ли оно с налл
                if(oldPriceElement != null){
                    oldPrice = oldPriceElement.innerText;
                }
                let titleElement = e.querySelector('.catalog-item__title') as HTMLElement;
                let title = "err: title not found";
                title = titleElement.innerText;

                let imgElement = e.querySelector('.catalog-item__img') as HTMLElement;
                let imgSrc = imgElement.getAttribute('src') ?? null;
                products.push({marketplace,title ,currentPrice, oldPrice,imgSrc, volume: null});
            }
            return products;
        }, marketplace);
        await page.close();
        return this.filterDublicateProducts(parsedData);
    }

}