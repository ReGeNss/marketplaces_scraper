export interface Category {
  marketplaces: string[],
  brands: {[k: string]: Product[]},
}

export interface Product {
  marketplace: string,
  title: string,
  currentPrice: string,
  oldPrice?: string,
  imgSrc?: string,
  volume?: string;
}

export interface FormattedData {
  [k: string]: Category,
}
