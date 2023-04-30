const db = require('../db/db');

async function createAnalysis(){

  analysis = [];
  // get unique sellers by name
  let uniqueSellers = await db.getUniqueSellers();
  uniqueSellers = uniqueSellers.map(row => row.seller_name)
  for(seller_name of uniqueSellers){
    let allLocale = await db.getUniqueSellerLocale(seller_name);
    allLocale = allLocale.map(row => row.locale);
    for(locale of allLocale){

      let seller_locale_avg = await db.getSellerLocaleAvg(seller_name, locale);

      let available_products = await db.getSellerLocaleProductsCount(seller_name, locale, true);

      let unavailable_products = await db.getSellerLocaleProductsCount(seller_name, locale, false);
      
      seller_locale = { 
        seller_name: seller_name,
        locale: locale,
        average_price: seller_locale_avg.avg_price,
        available_products: available_products.product_count,
        unavailable_products: unavailable_products.product_count,
      };
      
      analysis.push(seller_locale);
    };
  };
  return analysis;
};


module.exports = {
  createAnalysis
};