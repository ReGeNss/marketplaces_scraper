import { MongoClient } from 'mongodb';

const EMPTY_STRING = '';
const MIN_PRODUCT_COUNT = 3;
const MIN_BRAND_NAME_LENGTH = 2;
const LENGTH_OF_BRAND_NAME_CHECK = 2;
const NUMBERS_REG_EXP = new RegExp(/\d+/g);
const LITERS = 'л';
const MILLILITERS = 'мл';
const MAX_VOLUME_LENGTH = 4;
const BASE_MULTIPLIER = 10;

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
  'та',
  'сильногазований',
  'ПЕТ',
  'з/б',
  'середньогазований',
];

export class DataService {
  public getData = async () => {
    const mongoClient = new MongoClient(process.env.DB_URI);
    mongoClient.startSession();
    const collection = mongoClient.db(process.env.DB_NAME).collection(process.env.COLLECTION_NAME);
    const data = await collection.find().toArray();
    await mongoClient.close();
    return data;
  };

  public saveData = async (data: Data): Promise<void> => {
    const mongoClient = new MongoClient(process.env.DB_URI);
    mongoClient.startSession();
    const collection = mongoClient.db(process.env.DB_NAME).collection(process.env.COLLECTION_NAME);
    await collection.insertOne(data);
    await mongoClient.close();
  };

  private brandParser = (products: Product[]): Brand[] => {
    const brands: Brand[] = [];
    const otherProducts: Product[] = [];
    for (const product of products) {
      const splitedTitle = product.title.split(' ');
      splitedTitle.splice(LENGTH_OF_BRAND_NAME_CHECK, splitedTitle.length-LENGTH_OF_BRAND_NAME_CHECK);
      let brandName = '';

      for (let word of splitedTitle) {
        word = word.trim();
        if (word.toLowerCase() === 'energy') continue;
        if (word.includes('зі') || word.includes('смаком')) continue;

        const brandProducts: Product[] = [];
        products.forEach((e) => {
          if (e.title.trim().toLowerCase().includes(word.toLowerCase())) {
            brandProducts.push(...products.splice(products.indexOf(e), 1));
          }
        });
        if (brandProducts.length >= MIN_PRODUCT_COUNT) {
          brandName += ' ' + word;
          if (brandName.length <= MIN_BRAND_NAME_LENGTH)  continue;
          brands.push({ name: brandName, products: brandProducts });
          break;
        } else {
          otherProducts.push(product);
        }
      }
    }

    if (products.length > 0) {
      const otherProductFiltered = this.otherProductDuplicateRemove([...products, ...otherProducts]);
      brands.push({ name: 'other', products: otherProductFiltered });
    }
    const extendedBrands = this.extendBrandsName(brands);
    const formatedBrands = this.otherProductSpecificate(extendedBrands);
    return this.brandsDuplicateDelete(formatedBrands);
  };

  private extendBrandsName = (brands: Brand[]): Brand[] => {
    const indexOfOther = brands.findIndex((e) => e.name.toLowerCase().includes('other'));
    const otherProducts = brands.splice(indexOfOther, 1);
    for (const brand of brands) {
      const products = brand.products;
      let extendedName = '';
      const splitedProductName = brand.products[0].title.split(' ');
      for (const part of splitedProductName) {
        if (products.every((product) => product.title.toLowerCase().includes(part.toLowerCase()))) {
          extendedName+= ' ' + part;
        }
      }
      if (extendedName !== '') {
        brand.name = extendedName.trim();
      }
    }
    brands.push(...otherProducts);
    return brands;
  };

  private otherProductDuplicateRemove = (products: Product[]): Product[] => {
    const filteredProducts: Product[] = [];
    for (const product of products) {
      const isDuplicate = filteredProducts.some((oldProduct) =>
        oldProduct.marketplace === product.marketplace &&
          oldProduct.title === product.title &&
          oldProduct.currentPrice === product.currentPrice &&
          oldProduct.oldPrice === product.oldPrice &&
          oldProduct.imgSrc === product.imgSrc &&
          oldProduct.volume === product.volume,
      );
      if (!isDuplicate) {
        filteredProducts.push(product);
      }
    }
    return filteredProducts;
  };

  private otherProductSpecificate = (brands: Brand[]): Brand[] => {
    const otherProductsToValidate = brands.find((e) => e.name === 'other')?.products;
    if (otherProductsToValidate === undefined) return brands;
    const otherProducts = [...otherProductsToValidate];
    for (const product of otherProducts) {
      const splitedTitle = product.title.toLowerCase().split(' ');
      for (const brand of brands) {
        if (brand.name.toLowerCase().includes(splitedTitle[0])) {
          otherProductsToValidate.splice(otherProductsToValidate.indexOf(product), 1);
          brand.products.push(product);
          break;
        }
      }
    }
    return brands;
  };

  private brandsDuplicateDelete = (brands: Brand[]) => {
    const specificatedBrands: Brand[] = [];
    while (brands.length > 0) {
      brands.forEach((brand) => {
        const formatedBrandName = brand.name.toLowerCase().split(' ')[0];
        brands.splice(brands.indexOf(brand), 1);
        brands.forEach((brand) => {
          if (brand.name.trim().toLowerCase().includes(formatedBrandName)) {
            brand.products.push(...brand.products);
            specificatedBrands.push({ name: brand.name, products: brand.products });
            brands.splice(brands.indexOf(brand), 1);
          }
        });
        if (specificatedBrands.find((e) => e.name.toLowerCase() === brand.name.toLowerCase()) === undefined) {
          specificatedBrands.push(brand);
        }
      });
    }
    return specificatedBrands;
  };

  public filterAndTransformData (data: Product[], scrapedMarketplaces: string[]) {
    const normalizedProducts = this.productDataNormalize(data);
    const products = this.volumeParser(normalizedProducts);
    const brands = this.brandParser(products);
    return {
      brands: brands,
      marketplaces: scrapedMarketplaces,
    };
  };

  private productDataNormalize = (products: Product[]) => {
    const regex = new RegExp(KEYWORDS.join('|'), 'gi');
    for (const product of products) {
      product.title = product.title.normalize('NFC').replace(regex, EMPTY_STRING).trim();
    }
    return products;
  };

  private volumeParser = (products: Product[]): Product[] => {
    const symbolsRegEpx = new RegExp(/[.,:;!?@#%]+/g);
    const litreVolumeRegExp = new RegExp(/(^|[^а-яА-Я])л([^а-яА-Я]|$)/i);
    const floatVolumeRegExp = new RegExp(/(^|[^0-9])0\d+\s*л([^а-яА-Я]|$)/i);
    const litreOrMillilitreVolumeRegExp = new RegExp(/(^|[^а-яА-Я])(л|мл)([^а-яА-Я]|$)/i);

    for (const product of products) {
      product.title = product.title.replace(symbolsRegEpx, EMPTY_STRING);
      if (product.title.match(floatVolumeRegExp)) {
        const numbers = product.title.match(NUMBERS_REG_EXP);
        product.title = product.title.replace(NUMBERS_REG_EXP, EMPTY_STRING).trim();
        const volumeInString = numbers[numbers.length-1];
        product.volume = this.volumeDimensionalityFormatter(volumeInString);
      }else if (product.title.match(litreVolumeRegExp)) {
        this.assingVolume(product, LITERS);
      }else if (product.title.match(NUMBERS_REG_EXP)) {
        this.assingVolume(product, MILLILITERS);
      }
      product.title = product.title.replace(litreOrMillilitreVolumeRegExp,EMPTY_STRING).trim();
    }
    return products;
  };

  private volumeDimensionalityFormatter = (volume: string ): string => {
     const multiplier = Math.pow(BASE_MULTIPLIER, MAX_VOLUME_LENGTH - volume.length);
     return parseInt(volume) * multiplier + ' ' + MILLILITERS;
  }

  private assingVolume = (product: Product, measurementUnit: string): void => {
    const volume = product.title.match(NUMBERS_REG_EXP);
    product.title = product.title.replace(NUMBERS_REG_EXP, EMPTY_STRING).trim();
    product.volume = volume[0] + ' ' + measurementUnit;
  }
}
