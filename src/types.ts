interface Data {
    marketplaces: string[],
    brands: Brand[];
}

interface Brand {
    name: string,
    products: Product[];
}

interface Product {
    marketplace: string,
    title: string,
    currentPrice: string,
    oldPrice: string | null,
    imgSrc: string | null,
    volume: string | null;
}