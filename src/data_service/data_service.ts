import { MongoClient } from 'mongodb';

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

  private MINPRODUCTCOUNT = 3;
  private MINBRANDNAMELENGTH = 2;
  private LENGTHOFBRANDNAMECHECK = 2;

  private brandParser = (products: Product[]): Brand[] => {
    const brands: Brand[] = [];
    const otherProducts: Product[] = [];
    for (const product of products) {
      const splitedTitle = product.title.split(' ');
      splitedTitle.splice(this.LENGTHOFBRANDNAMECHECK, splitedTitle.length-this.LENGTHOFBRANDNAMECHECK);
      let brandName = '';

      for (let word of splitedTitle) {
        word = word.trim();
        if (word.toLowerCase() === 'energy') continue;
        const brandProducts: Product[] = [];
        if (word.includes('зі') || word.includes('смаком')) continue;

        products.forEach((e) => {
          if (e.title.trim().toLowerCase().includes(word.toLowerCase())) {
            brandProducts.push(...products.splice(products.indexOf(e), 1));
          }
        });
        if (brandProducts.length >= this.MINPRODUCTCOUNT) {
          brandName += ' ' + word;
          if (brandName.length <= this.MINBRANDNAMELENGTH)  continue;
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
    console.log('asdadada' + extendedBrands.length);
    const formatedBrands = this.otherProductSpecificate(extendedBrands);
    console.log('formated'+  formatedBrands.length);
    const a = this.brandsDuplicateDelete(formatedBrands);
    console.log(a);
    let e =0;
    for (const brand of a) {
      for (const product of brand.products) {
        e+=1;
      }
    }
    console.log(e);
    return a;
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
    console.log('start brands' + brands.length);
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
    console.log('end brands' + specificatedBrands.length);
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

  private KEYWORDS  = [
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


  private productDataNormalize = (products: Product[]) => {
    const regex = new RegExp(this.KEYWORDS.join('|'), 'gi');
    for (const product of products) {
      product.title = product.title.normalize('NFC').replace(regex, this.EMPTYSTRING).trim();
    }
    return products;
  };

  private VOLUMEREGEXP = new RegExp(/(^|[^а-яА-Я])л([^а-яА-Я]|$)/i);
  private EMPTYSTRING = '';

  private volumeParser = (products: Product[]) => {
    for (const product of products) {
      const title = product.title.toLowerCase();
      if (title.includes('мл')) {
        product.title = product.title.replace('мл', this.EMPTYSTRING).trim();
      } else if (title.match(this.VOLUMEREGEXP)) {
        product.title = product.title.replace(this.VOLUMEREGEXP, this.EMPTYSTRING).trim();
      }
    }
    for (const product of products) {
      const title = product.title.toLowerCase();
      switch (true) {
        case title.includes('500'):
          product.title = product.title.replace('500', this.EMPTYSTRING).trim();
          product.volume = '500 мл';
          break;
        case title.includes('0.5'):
          product.title = product.title.replace('0.5', this.EMPTYSTRING).trim();
          product.volume = '500 мл';
          break;
        case title.includes('0,5'):
          product.title = product.title.replace('0,5', this.EMPTYSTRING).trim();
          product.volume = '500 мл';
          break;
        case title.includes('250'):
          product.title = product.title.replace('250', this.EMPTYSTRING).trim();
          product.volume = '250 мл';
          break;
        case title.includes('0.25'):
          product.title = product.title.replace('0.25', this.EMPTYSTRING).trim();
          product.volume = '250 мл';
          break;
        case title.includes('0,25'):
          product.title = product.title.replace('0,25', this.EMPTYSTRING).trim();
          product.volume = '250 мл';
          break;
        case title.includes('0,33'):
          product.title = product.title.replace('0,33', this.EMPTYSTRING).trim();
          product.volume = '330 мл';
          break;
        case title.includes('330'):
          product.title = product.title.replace('330', this.EMPTYSTRING).trim();
          product.volume = '330 мл';
          break;
        case title.includes('0.33'):
          product.title = product.title.replace('0.33', this.EMPTYSTRING).trim();
          product.volume = '330 мл';
          break;
        case title.includes('1л'):
          product.title = product.title.replace('1л', this.EMPTYSTRING).trim();
          product.volume = '1 л';
          break;
        case title.includes('1'):
          product.title = product.title.replace('1', this.EMPTYSTRING).trim();
          product.volume = '1 л';
          break;
        case title.includes('0.75'):
          product.title = product.title.replace('0.75', this.EMPTYSTRING).trim();
          product.volume = '750 мл';
          break;
        case title.includes('0,75'):
          product.title = product.title.replace('0,75', this.EMPTYSTRING).trim();
          product.volume = '750 мл';
          break;
        case title.includes('750'):
          product.title = product.title.replace('750', this.EMPTYSTRING).trim();
          product.volume = '750 мл';
          break;
        case title.includes('355'):
          product.title = product.title.replace('355', this.EMPTYSTRING).trim();
          product.volume = '355 мл';
          break;
        case title.includes('473'):
          product.title = product.title.replace('473', this.EMPTYSTRING).trim();
          product.volume = '473 мл';
          break;
      }
      product.title = product.title.replace(/[\d.,:;!?@#]/g, this.EMPTYSTRING).trim();
    }
    return products;
  };
}
