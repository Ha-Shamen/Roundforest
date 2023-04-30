const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/app/server');
const db = require('../src/db/db');

chai.use(chaiHttp);
const should = chai.should();

// basic test
describe('/GET', () => {
  it('it should GET hello world', (done) => {

    chai.request(app)
      .get('/')
      .end((err, res) => {
        res.should.have.status(200);
        res.text.should.equal('Hello World!');
        done();
      });
  });
});

describe('Clear data', () => {
  it('it should clear products',(done) => { //Before each test we empty the database
    db.deleteAllProducts().then(() => {
      console.log('Products cleared successfully');
    })
    .catch((err) => {
      console.error('Error clearing products:', err);
    });
    done();
  })
});

describe('seller_product', () => {

  describe('/POST create', () => {
    it('it should add a seller product', (done) => {
      const sellerProduct = {
        ASIN: 'B00ZV9RDKK',
        locale: 'US',
        sellerName: 'John Doe',
        availability: true,
        price: 9.99,
        productName: 'Example Product',
        productLink: 'https://example.com/product'
      };
      chai.request(app)
        .post('/create')
        .send(sellerProduct)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('ASIN').eql('B00ZV9RDKK');
          res.body.should.have.property('locale').eql('US');
          res.body.should.have.property('sellerName').eql('John Doe');
          res.body.should.have.property('availability').eql(true);
          res.body.should.have.property('price').eql(9.99);
          res.body.should.have.property('productName').eql('Example Product');
          res.body.should.have.property('productLink').eql('https://example.com/product');
          done();
        });
    });

    it('it should add another seller product', (done) => {
      const sellerProduct = {
        ASIN: 'B00ZV9RDKK1',
        locale: 'US',
        sellerName: 'John Doe',
        availability: true,
        price: 9.99,
        productName: 'Example Product',
        productLink: 'https://example.com/product'
      };
      chai.request(app)
        .post('/create')
        .send(sellerProduct)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('ASIN').eql('B00ZV9RDKK1');
          res.body.should.have.property('locale').eql('US');
          res.body.should.have.property('sellerName').eql('John Doe');
          res.body.should.have.property('availability').eql(true);
          res.body.should.have.property('price').eql(9.99);
          res.body.should.have.property('productName').eql('Example Product');
          res.body.should.have.property('productLink').eql('https://example.com/product');
          done();
        });
    });

    it('it should fail to add a seller product', (done) => {
      const sellerProduct = {
        ASIN: 'B00ZV9RDKK1',
        locale: 'US',
        sellerName: 'John Doe',
        availability: true,
        price: 9.99,
        productName: 'Example Product',
        productLink: 'https://example.com/product'
      };
      chai.request(app)
        .post('/create')
        .send(sellerProduct)
        .end((err, res) => {
          res.should.have.status(500);
          res.text.should.equal('Error creating item. item already exists')

          done();
        });
    });

  });

   describe('/POST update', () => {
    it('it should POST an update seller product', (done) => {
      const sellerProduct = {
        ASIN: 'B00ZV9RDKK1',
        locale: 'US',
        sellerName: 'John Doe',
        availability: false,
        price: 9.99,
        productName: 'Example Product',
        productLink: 'https://example.com/product'
      };
      chai.request(app)
        .post('/update')
        .send(sellerProduct)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('ASIN').eql('B00ZV9RDKK1');
          res.body.should.have.property('locale').eql('US');
          res.body.should.have.property('sellerName').eql('John Doe');
          res.body.should.have.property('availability').eql(false);
          res.body.should.have.property('price').eql(9.99);
          res.body.should.have.property('productName').eql('Example Product');
          res.body.should.have.property('productLink').eql('https://example.com/product');
          done();
        });
    });
  });

  describe('/GET read', () => {
    it('it should GET product by ASIN and Locale', (done) => {
      const ASINLocale = {
        ASIN: 'B00ZV9RDKK',
        locale: 'US',
      }
      chai.request(app)
        .get('/read')
        .send(ASINLocale)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('ASIN').eql('B00ZV9RDKK');
          res.body.should.have.property('locale').eql('US');
          res.body.should.have.property('seller_name').eql('John Doe');
          res.body.should.have.property('availability').eql(1);
          res.body.should.have.property('price').eql(9.99);
          res.body.should.have.property('product_name').eql('Example Product');
          res.body.should.have.property('product_link').eql('https://example.com/product');
          done();
        });
    });
  });

   describe('/POST delete', () => {
    it('it should delete products', (done) => {
      const products = {products:[{
        ASIN: 'B00ZV9RDKK',
        locale: 'US'
      },
      {
        ASIN: 'B00ZV9RDKK2',
        locale: 'US'
      },
      {
        ASIN: 'B00ZV9RDKK1',
        locale: 'US'
      }]};
      chai.request(app)
        .post('/delete')
        .send(products)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('/GET readBySeller', () => {
    it('it should GET all products by seller name', (done) => {
      const seller_name = { sellerName: 'John Doe'};
      chai.request(app)
        .get('/readBySeller')
        .send(seller_name)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.equal(2);
          res.body[0].ASIN.should.be.equal('B00ZV9RDKK');
          res.body[1].ASIN.should.be.equal('B00ZV9RDKK1');
          done();
        });
    });
  });

  describe('/GET getAnalysis', () => {
    
    it('it should GET getAnalysis', async () => {
      await db.deleteAllProducts();

      let sellerProduct = {
        ASIN: '1',
        locale: 'US',
        sellerName: 'John Doe',
        availability: false,
        price: 4,
        productName: 'Example Product',
        productLink: 'https://example.com/product'
      };
      let ret = await db.createProduct(sellerProduct);
      sellerProduct = {
        ASIN: '2',
        locale: 'US',
        sellerName: 'John Doe',
        availability: true,
        price: 5,
        productName: 'Example Product',
        productLink: 'https://example.com/product'
      };
      ret = await db.createProduct(sellerProduct);
      sellerProduct = {
        ASIN: '1',
        locale: 'EU',
        sellerName: 'John Doe',
        availability: true,
        price: 9.99,
        productName: 'Example Product',
        productLink: 'https://example.com/product'
      };
      await db.createProduct(sellerProduct);
      sellerProduct = {
        ASIN: '12',
        locale: 'GE',
        sellerName: 'John Doen',
        availability: true,
        price: 5.99,
        productName: 'Example Product',
        productLink: 'https://example.com/product'
      };
      await db.createProduct(sellerProduct);
      sellerProduct = {
        ASIN: '2',
        locale: 'GE',
        sellerName: 'John Doen',
        availability: true,
        price: 99.99,
        productName: 'Example Product',
        productLink: 'https://example.com/product'
      };
      await db.createProduct(sellerProduct);
      chai.request(app)
        .get('/getAnalysis')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.equal(3);
        });
    });
  });

  describe('/POST upload file', () => {
    it('it should upload file', (done) => {

      chai.request(app)
        .post('/upload')
        .attach('file', process.cwd() + '/test/testseller_products.csv')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
      
    });
  });

  // describe('Clear all data', () => {
    
  //   it('it should clear all data', async () => {
  //     await db.deleteAllProducts();
  //   });
  // });
});
