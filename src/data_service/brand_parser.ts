export const brandParser = (products: Product[]) => {
        let brands: Brand[] = [];
        console.log('brandParser IN' + products.length);
        let otherProducts: Product[] = [];
        for(let product of products){
            let splitedTitle = product.title.split(' ');
            splitedTitle.splice(2, splitedTitle.length-2);
            let brandName = "";
            for(let word of splitedTitle ){
                word  =word.trim();
                if(word.toLowerCase() === 'energy' ) continue;
                let brandsProducts: Product[] = [];
                if (word.includes("зі") ||
                    word.includes("смаком")
                ) continue;
                products.forEach(e=> {
                    if(e.title.toLowerCase().trim().includes(word.toLowerCase().trim())){
                        brandsProducts.push(...(products.splice(products.indexOf(e),1)));
                    }
                })
                if(brandsProducts.length >= 3){
                    brandName = brandName + ' ' + word;
                    if(brandName.trim().length <= 2 )  continue;
                    brands.push({name: brandName.trim(), products: brandsProducts});
                    break;
                }else{
                    otherProducts.push(product);
                }

            }

        }
        if(products.length > 0){
            let otherProductFiltered = otherProductDuplicateRemove([...products,...otherProducts]);
            brands.push({name: "other", products: otherProductFiltered});
        }
        let extendedBrands = extendBrandsName(brands);
        let formatedBrands = otherProductSpecificate(extendedBrands);
        let finalizedBrands = brandsDublicateDelete(formatedBrands);
        let count = 0;
        finalizedBrands.forEach(e => {
            count += e.products.length;
        })
        console.log('brandParser OUT' + count)
        console.log(finalizedBrands);
        return finalizedBrands;
}

const extendBrandsName = (brands: Brand[]) => {
    let indexOfOther = brands.findIndex(e => e.name.toLowerCase().includes('other'));
    let otherProducts = brands.splice(indexOfOther, 1);
    for(let brand of brands){
        let products = brand.products;
        let extendedName = "";
        let splitedProductName = brand.products[0].title.split(' ');
        for(let part of splitedProductName){
            if(products.every(e => e.title.toLowerCase().includes(part.toLowerCase().trim()))){
                extendedName = extendedName + ' ' + part;
            }
        }
        if(extendedName != ''){
            brand.name = extendedName.trim();
        }
    }
    brands.push(...otherProducts);
    return brands;
}
const otherProductDuplicateRemove = (products: Product[]) => {
    let fitleredProducts: Product[] = [];
    for(let product of products){
        const isDuplicate = fitleredProducts.some(oldProduct =>
            oldProduct.marketplace === product.marketplace &&
            oldProduct.title === product.title &&
            oldProduct.currentPrice === product.currentPrice &&
            oldProduct.oldPrice === product.oldPrice &&
            oldProduct.imgSrc === product.imgSrc &&
            oldProduct.volume === product.volume
        );
        if (!isDuplicate) {
            fitleredProducts.push(product);
        }
    }
    return fitleredProducts;
}
const otherProductSpecificate = (brands: Brand[]) => {
    let otherProductsValide = brands.find(e => e.name === "other")?.products;
    if(otherProductsValide == undefined) return brands;
    let otherProducts = [...otherProductsValide];
    for(let product of otherProducts){
        let splitedTitle = product.title.toLowerCase().split(' ');
        for(let brand of brands){
            if(brand.name.toLowerCase().includes(splitedTitle[0])){
                otherProductsValide.splice(otherProductsValide.indexOf(product), 1);
                brand.products.push(product);
                break;
            }
        }
    }
    return brands;
}

const brandsDublicateDelete = (brands: Brand[]) => {
    let specificatedBrands: Brand[] = [];
    while(brands.length > 0) {
        brands.forEach(brand => {
            let formatedBrandName = brand.name.toLowerCase().trim();

            brands.splice(brands.indexOf(brand), 1);
            brands.forEach(e => {
                if (e.name.trim().toLowerCase().includes(formatedBrandName)) {
                    brand.products.push(...e.products);
                    specificatedBrands.push({name: brand.name, products: brand.products});
                    brands.splice(brands.indexOf(e), 1);
                }
            })
            if (specificatedBrands.find(e => e.name.toLowerCase() === brand.name.toLowerCase()) == undefined) {
                specificatedBrands.push(brand);
            }
        })
    }
    return specificatedBrands;
}

