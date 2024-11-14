import {Browser} from "puppeteer-core"
import {Scraper} from "./scraper"

export class TrashScraper extends Scraper{
    private siteUrl = 'https://thrash.ua/promotions';
    private marketplace = 'Траш';

    scrap:(browser:Browser) => Promise<Product[]> = async (browser) => {
        const page = await browser.newPage();
        await page.goto(this.siteUrl);
        await this.wait(2000);
        const marketplace = this.marketplace;
        const parsedData: Product[] = await page.evaluate((marketplace: string) => {
            const products: Product[] = [];
            let elements = document.querySelectorAll('.normal');
            for(let e of elements){
                let currentPriceInteger = (e.querySelector('.current-integer') as HTMLElement).innerText;
                let currentPriceFraction = (e.querySelector('.current-fraction') as HTMLElement ).innerText;

                let oldPriceInteger = (e.querySelector('.old-integer') as HTMLElement ).innerText;
                let oldPriceFraction = (e.querySelector('.old-fraction') as HTMLElement ).innerText;

                let currentPrice = currentPriceInteger + '.' + currentPriceFraction;
                let oldPrice = oldPriceInteger + '.' + oldPriceFraction;

                let titleElement = e.querySelector('.product-title') as HTMLElement;
                let title = titleElement.innerText;

                let imgElement = e.querySelector('.product-img') as HTMLElement;
                let imgSrc = imgElement.getAttribute('src');
                products.push({marketplace,title ,currentPrice, oldPrice,imgSrc, volume: null});
            }
            return products;
        },marketplace);
        await page.close();
        return this.filterDublicateProducts(parsedData);
    }
}