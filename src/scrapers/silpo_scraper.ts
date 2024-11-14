import {Browser} from "puppeteer-core"
import {Scraper} from "./scraper"

export class SilpoScraper extends Scraper{
    private siteUrl = 'https://silpo.ua/category/energetychni-napoi-59';
    private marketplace = "Сільпо";

    scrap:(browser:Browser) => Promise<Product[]> = async (browser) => {
        const page = await browser.newPage();
        await page.goto(this.siteUrl);
        await this.wait(4000);
        await page.click('body > sf-shop-silpo-root > shop-silpo-root-shell > silpo-shell-main > div > div.main__body > silpo-category > silpo-catalog > div > div.container.catalog__products > div > ecomui-pagination > div > button > div');
        await this.wait(2000);
        // await page.evaluate(async () => {
        //     const sleep = () =>  {
        //         return new Promise(resolve => setTimeout(resolve, 4000));
        //     };
        //     for(let i =0 ; i < 7 ; i++){
        //         window.scrollBy(0, window.innerHeight);
        //         await sleep();
        //     }
        //
        // });
        const marketplace = this.marketplace;
        const parsedData: Product[] = await page.evaluate((marketplace) => {
            const products: Product[] = [];
            let elements = document.querySelectorAll('.ng-star-inserted');
            for(let e of elements){
                let currentPriceElement = e.querySelector('.ft-whitespace-nowrap') as HTMLElement;
                if(currentPriceElement == null){
                    continue;
                }
                let currentPrice = currentPriceElement.innerText;
                let oldPriceElement = e.querySelector('.ft-line-through') as HTMLElement;
                let oldPrice = null; // подумай нужно ли оно с налл
                if(oldPriceElement != null){
                    oldPrice = oldPriceElement.innerText;
                }
                let titleElement = e.querySelector('.product-card__title') as HTMLElement;
                if(titleElement == null){
                    continue;
                }
                let title:string = titleElement.innerText;

                let imgElement = e.querySelector('.product-card__top-inner') as HTMLElement;
                let imgSrc = (imgElement?.firstChild as HTMLElement)?.getAttribute('src');
                // addProduct(products,{marketplace,title ,currentPrice, oldPrice,imgSrc, volume: null});
                products.push({marketplace,title ,currentPrice, oldPrice,imgSrc, volume: null});
            }
            return products;
        },marketplace);
        await page.close();
        return this.filterDublicateProducts(parsedData);
    }

}