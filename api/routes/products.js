const Product = require('../models/product')

module.exports = function(app){
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const multer = require('multer')
const checkAuth = require('../middleware/check-auth')

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/')
    },
    filename: function(req, file, cb){
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'img/png'){
        cb(null, true)
    } else {
        cb(null, false)
    }
      
}

const upload = multer({storage, 
    limits: {
    fileSize: 1024 * 1024 * 5
},
    fileFilter: fileFilter
})

    app.use('/products', router)


    router.get('/', async (req, res, next) => {
        try{
            const docs = await Product.find().select('name price _id productImage')
            
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' +doc._id
                        }
                    }
                })
            }
    
            res.status(200).json(response)
    
        } catch(err){
            console.log(err)
            res.status(500).json({error: err})
        }
        
    
    })
    
    router.post('/', checkAuth, upload.single('productImage') ,  async (req, res, next) => {
        
        const product = await new Product({
            
            name: req.body.name,
            price: req.body.price,
            productImage: req.file.path
        })
        try {
            const result = await product.save()
          console.log(result)  
          res.status(201).json({
            message: 'Created product successfully',
            createdProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + result._id
                }
            }
        })
    
        } catch(err) {
            console.log(err)
            res.status(500).json({error: err})
         }
    
    })
    
    router.get('/:productId', async (req, res, next) => {
        const id = req.params.productId
        try {
          const doc = await Product.findById(id).select('name price _id productImage')
          if(doc){
            console.log(doc)
          res.status(200).json({
              product: doc,
              request: {
                  type: 'GET',
                  url: 'http://localhost:3000/products'
              }
    
          })
          } else {
              res.status(404).json({message: 'No valid entry found for provided ID'})
          }
          
        } catch(err){
            console.log(err)
            res.status(500).json({error: err})
        }
        
    })
    
    router.patch('/:productId', checkAuth, async (req, res, next) => {
        const id = req.params.productId
        const updateOps = {}
        for(const ops of req.body){
            updateOps[ops.propName] = ops.value
        }
       try {
           const result =  await Product.update({_id: id}, {$set:  updateOps })
          
           res.status(200).json({
               message: 'Product updated',
               request: {
                   type: 'GET',
                   url: `http://localhost:3000/products/${id}`
               }
           })
       } catch(err){
           console.log(err)
           res.status(500).json({error: err})
       }
    })
    
    router.delete('/:productId', checkAuth, async (req, res, next) => {
        
        try {
            const id = req.params.productId
           const prod = await Product.remove({_id: id})
           console.log(prod)
           res.status(200).json({
               message: 'product deleted',
               request: {
                   type: 'POST',
                   url: `http://localhost:3000/products`,
                   body: {name: 'String', price: 'Number'}
               }
           })
        } catch(err){
            console.log(err)
            res.status(500).json({error: err})
        }
        
    })
}







