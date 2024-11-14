import {Browser} from "puppeteer-core"
import {Scraper} from "./scraper"

export class ForaScraper extends Scraper{
    private siteUrl = 'https://fora.ua/category/energetychni-napoi-2486';
    private marketplace = "Фора";

    scrap:(browser:Browser) => Promise<Product[]> = async (browser) => {
        const page = await browser.newPage();
        await page.goto(this.siteUrl);
        await this.wait(2000);
        const marketplace = this.marketplace;
        const parsedData = await page.evaluate((marketplace: string) => {
            const products:Product[] = [];
            let elements = document.querySelectorAll('.product-list-item');
            for(let e of elements){
                let pricesBloc = e.querySelector('.product-price-container') as HTMLElement;
                if( pricesBloc == null){
                    console.log('pricesBloc is null');
                    continue;
                }
                let currentPriceInt = (pricesBloc.querySelector('.current-integer') as HTMLElement).innerText;
                let currentPriceFractionElement = pricesBloc.querySelector('.current-fraction') as HTMLElement;
                // if(currentPriceFractionElement == null){continue;}
                let currentPriceFraction = currentPriceFractionElement.innerText ;
                let currentPrice = currentPriceInt + '.' + currentPriceFraction;

                let oldPriceElement = pricesBloc.querySelector('.old-integer') as HTMLElement;
                let oldPrice = null; // подумай нужно ли оно с налл
                if(oldPriceElement != null){
                    oldPrice = oldPriceElement.innerText;
                }
                let titleElement = e.querySelector('.product-title') as HTMLElement;
                let title = titleElement.innerText;

                let imgElement = e.querySelector('.product-list-item__image') as HTMLElement;
                let imgSrc = imgElement.getAttribute('src');
                products.push({marketplace, title,currentPrice,oldPrice,imgSrc, volume: null });
            }
            return products;
        },marketplace);
        await page.close();
        return this.filterDublicateProducts(parsedData);
    }

}