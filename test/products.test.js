process.env.NODE_ENV = 'test'


const app = require('../server') // Link to your server file
const supertest = require('supertest')
const request = supertest(app)
const mongoose = require("mongoose");

const Product = require('../api/models/product')

const products = [
    {
      name: "Pavel",
      price: 111,
      productImage: 'https://miro.medium.com/max/1200/1*eQsKQZYYDdhuaygffOW7SQ.png'
    },
    {
      
        name: "Zell",
        price: 122,
        productImage: 'https://miro.medium.com/max/1200/1*eQsKQZYYDdhuaygffOW7SQ.png'
      },
    {
      
        name: "Noname",
        price: 123,
        productImage: 'https://miro.medium.com/max/1200/1*eQsKQZYYDdhuaygffOW7SQ.png'
      }
  ];


  beforeEach(async () => {
    await Product.create(products);
  });
  
  async function removeAllCollections() {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName];
      await collection.deleteMany();
    }
  }
  
  
  beforeAll(async () => {
    //const url = `mongodb://127.0.0.1/${databaseName}`;
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
  })
  });


  it('gets the test endpoint', async done => {
    const response = await request.get('/products')
    
   
    expect(response.status).toBe(200)
    
    done()
  })

  
it("Should save user to database", async done => {
  const res = await request.post("/products").send({
    name: "Nonamee",
    price: 1111111,
    productImage: 'https://miro.medium.com/max/1200/1*eQsKQZYYDdhuaygffOW7SQ.png'
  });

  expect(res.status).toBe(201)
  
  expect(res.body.name).toBeTruthy()
  expect(res.body.price).toBeTruthy()


  const product = await Product.findOne({name: "Nonamee"})
  expect(product.name).toBeTruthy();
  expect(product.price).toBeTruthy();

  done();
});


  afterEach(async () => {
    await removeAllCollections();
  });
  