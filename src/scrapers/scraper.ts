export class Scraper {
  wait:(ms:number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  filterDuplicateProducts = (products: Product[]) => {
    const filteredProducts: Product[] = [];
    products.forEach((product) => {
      this.addProduct(filteredProducts, product);
    });
    return filteredProducts;
  };

  private addProduct = (products: Product[], newProduct: Product) => {
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
