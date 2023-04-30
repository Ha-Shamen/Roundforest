const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const workDir = process.cwd();
const DB_PATH = path.join(workDir, 'database/sellers_products.db');
const TABLE_NAME = process.env.TABLE_NAME || 'seller_product';


if (!fs.existsSync(DB_PATH)) {
    fs.writeFile(DB_PATH, '', (err) => {
        if (err) throw err;
        console.log(`File ${DB_PATH} created successfully in ${workDir}`);
    });
}


const db = new sqlite3.Database(DB_PATH, err => {
    if (err) {
        console.error(err.message);
        throw err;
    }
    console.log(`Connected to the SQLite database at ${DB_PATH}`);
});



db.run(`CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ASIN TEXT,
    locale TEXT,
    seller_name TEXT,
    availability INTEGER,
    price REAL,
    product_name TEXT,
    product_link TEXT
  )`, err => {
    if (err) {
        console.error(err.message);
        throw err;
    }
    console.log(`Table ${TABLE_NAME} has been created`);
});

// Create index on primary keys, seller_name and product_name
db.run(`CREATE INDEX IF NOT EXISTS idx_seller_product ON ${TABLE_NAME} (ASIN, locale, seller_name, product_name)`, err => {
    if (err) {
        console.error(err.message);
        throw err;
    }
    console.log(`Table ${TABLE_NAME} indices created`);
});


// Create index unique constraint on ASIN and Locale combination
db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_seller_product_asin_locale ON ${TABLE_NAME} (ASIN, locale);`, err => {
    if (err) {
        console.error(err.message);
        throw err;
    }
    console.log(`Table ${TABLE_NAME} created unique constraint on ASIN and Locale combination`);
});

function createProduct(product) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO ${TABLE_NAME} (ASIN, locale, seller_name, availability, price, product_name, product_link) VALUES (?, ?, ?, ?, ?, ?, ?)`, [product.ASIN, product.locale, product.sellerName, product.availability, product.price, product.productName, product.productLink], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

function getProduct(ASIN, Locale) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM ${TABLE_NAME} WHERE ASIN = ? AND locale = ?`, [ASIN, Locale], function (err, row) {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function getAll() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${TABLE_NAME}`, [], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function getSellerProducts(sellerName) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${TABLE_NAME} WHERE seller_name = ?`, [sellerName], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function updateProduct(product) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE ${TABLE_NAME} SET seller_name = ?, availability = ?, price = ?, product_name = ?, product_link = ? WHERE ASIN = ? AND locale = ?`, [product.sellerName, product.availability, product.price, product.productName, product.productLink, product.ASIN, product.locale], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
}

function deleteProduct(ASIN, locale) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM ${TABLE_NAME} WHERE ASIN = ? AND locale = ?`, [ASIN, locale], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
}

async function deleteProducts(products) {
    const promises = products.map(deleteProduct);
    const results = await Promise.allSettled(promises);
    return results;
  }

function deleteAllProducts() {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM ${TABLE_NAME}`, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
}

async function createOrUpdateProduct(product) {
    try {
        const existingProduct = await getProduct(product.ASIN, product.locale);
        if (existingProduct) {
            const changes = await updateProduct(product);
            console.log(`${changes} row(s) updated`);
        } else {
            const id = await createProduct(product);
            console.log(`Product created with id ${id}`);
        }
    } catch (err) {
        console.error(err);
    }
}

async function uploadProducts(products){
    
}

function getUniqueSellers() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT DISTINCT seller_name FROM ${TABLE_NAME}`, [], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function getUniqueSellerLocale(seller_name) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT DISTINCT locale FROM ${TABLE_NAME} WHERE seller_name = ?`, [seller_name], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function getSellerLocaleAvg(seller_name, locale) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT AVG(PRICE) as avg_price FROM ${TABLE_NAME} WHERE seller_name = ? AND locale = ?`, [seller_name, locale], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function getSellerLocaleProductsCount(seller_name, locale, availability) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT count(*) as product_count FROM ${TABLE_NAME} WHERE seller_name = ? AND locale = ? AND availability = ?`, [seller_name, locale, availability], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

module.exports = {
    createProduct,
    getAll,
    getProduct,
    getSellerProducts,
    updateProduct,
    deleteProducts,
    deleteAllProducts,
    createOrUpdateProduct,
    getUniqueSellers,
    getUniqueSellerLocale,
    getSellerLocaleAvg,
    getSellerLocaleProductsCount
};
