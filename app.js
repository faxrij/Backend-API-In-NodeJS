
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//ROUTES
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');
const todoRoutes = require('./api/routes/toDo');


require('dotenv').config();

const uri = process.env.ATLAS_URI2

//CONNECTION TO MONGODB

mongoose.connect(
    uri, {useNewUrlParser: true}
    // "mongodb+srv://admin:"+ process.env.MONGO_ATLAS_PASSWORD1 + "@node-rest-shop.ujhqgj0.mongodb.net/?retryWrites=true&w=majority"
);

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("Connected Database Successfully");
})


//GETTING RID OF DEPRECATION MESSAGES ON TERMINAL
mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));  //STATICLY CREATING UPLOADS FOLDER
app.use(bodyParser.urlencoded({extended: false}));  //BODY PARSER ACCEPTING WITH URLENCODED AND JSON
app.use(bodyParser.json());


//HANDLING CORS ERRORS 
app.use((req, res, next) =>{
    res.header("Access-Control-Allow-Origin","*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','Put,Post,Patch,Delete,Get');
        return res.status(200).json({});
    }
    next();
})


// Routes which should handle requests
app.use('/products',productRoutes);
app.use('/orders',orderRoutes);
app.use('/user',userRoutes);
app.use('/todo',todoRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) =>{
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    });
})

module.exports = app;