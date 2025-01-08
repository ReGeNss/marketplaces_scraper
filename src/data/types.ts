export interface Data {
  marketplaces: string[],
  brands: Map<string, Product[]>
}

export interface Product {
  marketplace: string,
  title: string,
  currentPrice: string,
  oldPrice: string | null,
  imgSrc: string | null,
  volume: string | null;
}
