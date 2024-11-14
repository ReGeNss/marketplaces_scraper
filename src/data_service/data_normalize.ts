const keyWords  = [
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
]
export const productDataNormalize = (products: Product[]) => {
    const regex = new RegExp(keyWords.join("|"), "gi");
    for(let product of products){
        product.title = product.title.normalize("NFC").replace(regex, '').trim();

    }
    return products;
};
