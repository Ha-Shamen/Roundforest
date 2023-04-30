const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const db = require('../db/db');
const { createAnalysis } = require('../services/createAnalysis');
const { csvToDb } = require('../services/processCSV');

const app = express();

app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/create', (req, res) => {
  const { ASIN, locale, sellerName, availability, price, productName, productLink } = req.body;
  const newProduct = {
    ASIN: ASIN,
    locale: locale,
    sellerName: sellerName,
    availability: availability,
    price: price,
    productName: productName,
    productLink: productLink
  };
  return db.createProduct(newProduct).then(() => {
    console.log('Product created successfully');
    res.status(200).json(newProduct);
  })
  .catch((err) => {
    console.error('Error creating product:', err);
    db.getProduct(newProduct.ASIN, newProduct.locale).then((existingProduct) => {
      console.log('Product retrieved successfully. Attempt to create duplicate');
      res.status(500).send('Error creating item. item already exists');
    })
    .catch((err) => {
      console.error('Error retrieving product issue with something different:', err);
      res.status(500).send('Error creating item. please confirm the request is in the correct format');
    });
  });
});

app.get('/read', (req, res) => {
  const { ASIN, locale } = req.body;
 
  return db.getProduct(ASIN, locale).then((existingProduct) => {
    console.log('Product retrieved successfully');
    res.status(200).json(existingProduct);
  })
  .catch((err) => {
    console.error('Error retrieving product:', err);
    res.status(500).send('Error retrieving item');
  });
  
});

app.post('/update', (req, res) => {
  const { ASIN, locale, sellerName, availability, price, productName, productLink } = req.body;
  const updatedProduct = {
    ASIN: ASIN,
    locale: locale,
    sellerName: sellerName,
    availability: availability,
    price: price,
    productName: productName,
    productLink: productLink
  };
 
  return db.getProduct(ASIN, locale).then((existingProduct) => {
    console.log('Product retrieved successfully');
    db.updateProduct(updatedProduct).then((productUpdated) => {
      console.log('Product updated successfully');
      res.status(200).json(updatedProduct);
    })
    .catch((err) => {
      console.error('Error updating product:', err);
      res.status(500).send('Error updating item');
    });
  })
  .catch((err) => {
    console.error('Error retrieving product:', err);
    res.status(500).send('Error retrieving item');
  });
  
});

app.post('/delete', (req, res) => {
  const products = req.body.products;

  db.deleteProducts(products)
  .then((results) => {
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        console.log(`succeed: ${result.value}`);
      } else {
        console.error(`failed: ${result.reason}`);
      }
    });
    res.status(200).send('Success deleteProducts not all products deleted');
  })
  .catch((error) => {
    console.error(`Error processing products: ${error}`);
    res.status(500).send('Error deleteProducts not all products deleted');
  });
});

app.get('/readBySeller', (req, res) => {
  const { sellerName } = req.body;
  return db.getSellerProducts(sellerName).then((sellerProducts) => {
    console.log('Products retrieved successfully');
    res.status(200).json(sellerProducts);
    
  })
  .catch((err) => {
    console.error('Error retrieving products:', err);
    res.status(500).send('Error retrieving sellect products');
  });
});

app.get('/read', (req, res) => {
  const { ASIN, locale } = req.body;
 
  return db.getProduct(ASIN, locale).then((existingProduct) => {
    console.log('Product retrieved successfully');
    res.status(200).json(existingProduct);
  })
  .catch((err) => {
    console.error('Error retrieving product:', err);
    res.status(500).send('Error retrieving item');
  });
  
});

app.get('/getAnalysis', (req, res) => {
 
  return createAnalysis().then((analysis) => {
    res.status(200).json(analysis);
  })
  .catch((err) => {
    console.error('Error creating analysis:', err);
    res.status(500).send('Error creating analysis');
  });;
  
});

const upload = multer({ dest: process.cwd() +'/uploads/' });
app.post('/upload', upload.single('file'), async (req, res) => {
  if (req.file == undefined) {
    return res.status(400).send("Please upload a CSV file!");
  }
  else if (!req.file.mimetype.includes('csv')){
    return res.status(400).send("Please upload a CSV file!");
  }
  csvToDb(req.file.path, req.file.originalname).then(() => {
    console.log('uploaded successfully');
    res.status(200).json({
      msg: 'File successfully uploaded! please wait for confirmation mail that the data was inserted successfully',
      file: req.originalname,
    });
  })
  .catch((err) => {
    console.error('upload failed:', err);
    res.status(500).send('Error uploading file');
  });
})


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app; // for testing