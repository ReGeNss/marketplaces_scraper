import { productDataNormalize } from './data_normalize';
import {brandParser} from './brand_parser';
import {volumeParser} from './volume_parser';

export class DataService{
    private filterAndTransformData(data: Product[], scrapedMarketplaces: string[]){
        const normalizedProducts = productDataNormalize(data);
        const products = volumeParser(normalizedProducts);
        const brands = brandParser(products);
        const marketplacesData = {
            brands: brands,
            marketplaces: scrapedMarketplaces
        }
        return marketplacesData;
    };
    getFormattedData = (data: Product[], scrapedMarketplaces: string[]) => {
        let filteredData = this.filterAndTransformData(data, scrapedMarketplaces);
        return filteredData;
    }
}