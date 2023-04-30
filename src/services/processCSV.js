const db = require('../db/db');
const fs = require('fs');

const { parse } = require('csv-parse');
const Path = require('path')

  
async function csvToDb(csvUrl, originalFileName) {
    products = []
    const seller_name = Path.parse(originalFileName).name.split('_')[0]
    return fs.createReadStream(csvUrl)
        .pipe(parse({ delimiter: ",", from_line: 2 }))
            .on('data', function (data) {
                product = {};
                product.ASIN = data[0];
                product.locale = data[1];
                product.price = data[2];
                product.proudct_name = data[3];
                product.product_link = data[4];
                product.sellerName = seller_name;
                product.availability = true;
                products.push(product);
            })
            .on('end', async function () {
            //products.shift()
            for(product of products){
                await db.createOrUpdateProduct(product);
            }
            fs.unlinkSync(csvUrl);
            })
            .on("error", function (error) {
                console.error(error.message);
            });
    
  }

  module.exports = {
    csvToDb
  };