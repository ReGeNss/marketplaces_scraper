import { Product } from '../data/types';

export class Scraper {
  public timeout = 300000;

  public filterDuplicateProducts = (products: Product[]): Product[] => {
    const filteredProducts: Product[] = [];
    for (const product of products) {
      this.addProduct(filteredProducts, product);
    }
    return filteredProducts;
  };

  private addProduct = (products: Product[], newProduct: Product): void => {
    const isDuplicate = products.some((product) =>
      product.marketplace === newProduct.marketplace &&
      product.title === newProduct.title &&
      product.currentPrice === newProduct.currentPrice &&
      product.oldPrice === newProduct.oldPrice &&
      product.imgSrc === newProduct.imgSrc &&
      product.volume === newProduct.volume,
    );

    if (!isDuplicate) {
      products.push(newProduct);
    }
  };
}
