import { Data, Product } from './types';

const EMPTY_STRING = '';
const MIN_PRODUCT_COUNT = 2;
const LITERS = 'л';
const MILLILITERS = 'мл';
const MAX_VOLUME_LENGTH = 4;
const BASE_MULTIPLIER = 10;
const NUMBERS_REG_EXP = new RegExp(/\d+/g);
const SYMBOLS_REG_EPX = new RegExp(/[.,:;!?@#%]+/g);
const LITRE_VOLUME_REG_EXP = new RegExp(/(^|[^а-яА-Я])л([^а-яА-Я]|$)/i);
const FLOAT_VOLUME_REG_EXP = new RegExp(/(^|[^0-9])0\d+\s*л([^а-яА-Я]|$)/i);
const LITRE_OR_MILLILITRE_VOLUME_REG_EXP = new RegExp(/(^|[^а-яА-Я])(л|мл)([^а-яА-Я]|$)/i);

const KEYWORDS  = [
  'напій',
  'Нaпій',
  'безалкогольний',
  'бeзaлкoгoльний',
  'енергетичний',
  'газований',
  'гaзoвaний',
  'ж/б',
  'eнepгeтичний',
  'енергетик',
  'та',
  'сильногазований',
  'ПЕТ',
  'з/б',
  'середньогазований',
];

const brandParser = (products: Product[]): Map<string, Product[]> => {
  const brands: Map<string, Product[]> = new Map();
  for (const product of products) {
    const splitedTitle = product.title.toLowerCase().split(' ');
    const firstWordOfBrand = splitedTitle[0];
    if (brands.has(firstWordOfBrand)) {
      brands.get(firstWordOfBrand).push(product);
      continue;
    }
    brands.set(firstWordOfBrand, [product]);
  }

  brands.set('other', []);
  for (const [brand, products] of brands) {
    if (products.length < MIN_PRODUCT_COUNT) {
      brands.get('other').push(...products);
      brands.delete(brand);
    }
  }
  return extendBrandsName(brands);
};

const extendBrandsName = (brands: Map<string, Product[]>): Map<string, Product[]> => {
  const brandsWithExtendedNames = new Map();
  for (const [brand, products] of brands) {
    let extendedName = '';
    const splitedProductName = products[0].title.toLowerCase().split(' ');
    for (const part of splitedProductName) {
      if (products.every((product: Product) => product.title.toLowerCase().includes(part))) {
        extendedName += ' ' + part;
      }
    }
    if (extendedName !== EMPTY_STRING) {
      brandsWithExtendedNames.set(extendedName.trim(), [...brands.get(brand)]);
    } else {
      brandsWithExtendedNames.set(brand, [...brands.get(brand)]);
    }
  }
  return brandsWithExtendedNames;
};

const productDataNormalize = (products: Product[]) => {
  const regex = new RegExp(KEYWORDS.join('|'), 'gi');
  for (const product of products) {
    product.title = product.title.normalize('NFC').replace(regex, EMPTY_STRING).trim();
  }
  return products;
};

const volumeParser = (products: Product[]): Product[] => {
  for (const product of products) {
    product.title = product.title.replace(SYMBOLS_REG_EPX, EMPTY_STRING);
    if (product.title.match(FLOAT_VOLUME_REG_EXP)) {
      const numbers = product.title.match(NUMBERS_REG_EXP);
      product.title = product.title.replace(NUMBERS_REG_EXP, EMPTY_STRING).trim();
      const volumeInString = numbers[numbers.length-1];
      product.volume = volumeDimensionalityFormatter(volumeInString);
    } else if (product.title.match(LITRE_VOLUME_REG_EXP)) {
      assingVolume(product, LITERS);
    } else if (product.title.match(NUMBERS_REG_EXP)) {
      assingVolume(product, MILLILITERS);
    }
    product.title = product.title.replace(LITRE_OR_MILLILITRE_VOLUME_REG_EXP, EMPTY_STRING).trim();
  }
  return products;
};

const volumeDimensionalityFormatter = (volume: string): string => {
  const multiplier = Math.pow(BASE_MULTIPLIER, MAX_VOLUME_LENGTH - volume.length);
  return parseInt(volume) * multiplier + ' ' + MILLILITERS;
};

const assingVolume = (product: Product, measurementUnit: string): void => {
  const volume = product.title.match(NUMBERS_REG_EXP);
  product.title = product.title.replace(NUMBERS_REG_EXP, EMPTY_STRING).trim();
  product.volume = volume[0] + ' ' + measurementUnit;
};

const filterAndTransformData =  (data: Product[], scrapedMarketplaces: string[]): Data =>  {
  const normalizedProducts = productDataNormalize(data);
  const products = volumeParser(normalizedProducts);
  const brands = brandParser(products);
  return {
    brands: Object.fromEntries(brands),
    marketplaces: scrapedMarketplaces,
  };
};

export default filterAndTransformData;
