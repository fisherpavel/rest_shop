const dotenv = require('dotenv').config()
const config = require('./config/config')
const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const productRoutes = require('./api/routes/products')
const ordersRoutes = require('./api/routes/orders')
const userRoutes = require('./api/routes/user')

mongoose.connect(`mongodb+srv://pavel:`+process.env.MONGO_ATLAS_PW+`@cluster0-hid6k.mongodb.net/restapi?retryWrites=true&w=majority`, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})

app.use(morgan('dev'))
app.use('/uploads' ,express.static('uploads'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({})
    }
    next()
})

productRoutes(app)
// app.use('/products', productRoutes)
app.use('/orders', ordersRoutes)
app.use('/user', userRoutes)


app.use((req, res, next) => {
    const error = new Error('Not found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app


