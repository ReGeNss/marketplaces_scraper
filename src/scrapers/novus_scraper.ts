import {Browser} from "puppeteer-core"
import {Scraper} from "./scraper"

export class NovusScraper extends Scraper{
    private siteUrl = 'https://novus.zakaz.ua/uk/categories/energy-drinks/';
    private marketplace = "Новус";

    scrap:(browser:Browser) => Promise<Product[]> = async (browser) => {
        const page = await browser.newPage();
        await page.goto(this.siteUrl);
        await this.wait(4000);
        // await page.evaluate(async () => {
        //     const sleep = () =>  {
        //         return new Promise(resolve => setTimeout(resolve, 4000));
        //     };
        //     let elememt = document.querySelector("#PageWrapBody_desktopMode > div.jsx-e14abeb0dec5e794.CategoryProductBox__loadMore > button");
        //     if(elememt != null){
        //         (elememt as HTMLElement ).click();
        //         await sleep();
        //     }
        // });
        for(let i =0 ; i < 2 ; i++){
            await page.click("#PageWrapBody_desktopMode > div.jsx-e14abeb0dec5e794.CategoryProductBox__loadMore > button");
            await this.wait(4000);
        }
        const marketplace = this.marketplace;
        const parsedData: Product[] = await page.evaluate((marketplace) => {
            const products: Product[] = [];
            let elements = document.querySelectorAll('.ProductsBox__listItem');
            for(let e of elements){
                let currentPriceElement = e.querySelector('.Price__value_caption') as HTMLElement;
                if(currentPriceElement == null){
                    continue;
                }
                let currentPrice = currentPriceElement.innerText;
                let oldPriceElement = e.querySelector('.Price__value_body') as HTMLElement;
                let oldPrice =null;
                if( oldPriceElement !== null){
                    oldPrice = oldPriceElement.innerText;
                }
                let titleElement = e.querySelector('.ProductTile__title') as HTMLElement;
                if(titleElement == null){
                    continue;
                }
                let title:string = titleElement.innerText;

                let imgElement = e.querySelector('.ProductTile__imageContainer') as HTMLElement;
                let imgSrc = (imgElement?.firstChild as HTMLElement)?.getAttribute('src');
                products.push({marketplace,title ,currentPrice, oldPrice,imgSrc, volume: null});

            }
            return products;
        },marketplace);
        await page.close();
        return this.filterDublicateProducts(parsedData);
    }
}