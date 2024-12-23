export interface Data {
  marketplaces: string[],
  brands: Brand[];
}

export interface Brand {
  name: string,
  products: Product[];
}

export interface Product {
  marketplace: string,
  title: string,
  currentPrice: string,
  oldPrice: string | null,
  imgSrc: string | null,
  volume: string | null;
}
