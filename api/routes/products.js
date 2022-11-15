
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

//IT IS WHERE WE STORE FILES

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null,'./uploads/');
    },

    //IT IS HOW FILES ARE NAMED IN OUR STORAGE

    filename: function(req, file, cb){
        cb(null,new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {

    //FILTERING AND ACCEPTING FILETYPES

    if(file.mimetype === 'image/jpeg' || file.mimetype==='image/png' || file.mimetype ==='image/webp'){
        cb(null,true);
    } 
    else{     //REJECTING FILE
        cb(null,false);
    }

};

//SIZE OF FILE THAT CAN BE UPLOADED

const upload = multer({storage:storage, limits:{
    fieldSize:1024*1024*5
},
    fileFilter:fileFilter

});

//IMPORTING MODEL
const Product = require('../models/product');
// const User = require('../models/user');

router.get('/', (req, res, next) => {
    Product.find()
    .select('name price _id productImage')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs.map(doc => {
                return {
                    name :doc.name,
                    price: doc.price,
                    productImage: doc.productImage,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products' + doc._id
                    }
                };
            })
        };
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        })
    })
    
});

router.post('/',checkAuth,upload.single('productImage'), (req, res, next) => {
  
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });

    product
    .save()
    .then(result => {

        console.log(result);
        res.status(201).json({
        message : 'Created product successfully',
        createdProduct: {
            name: result.name,
            price: result.price,
            _id: result._id,
            request: {
                type: 'GET',
                url: "http://localhost:3000/products"+ result._id
            }
        }

        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        });
    });

});

router.get('/:productId', (req, res, next) =>{

    const id = req.params.productId;
    
    Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc => {
        console.log("From database", doc);
        if(doc){
        res.status(200).json({
            product: doc,
            request: {
                type: "GET",
                description: "To get all products",
                url: 'http://localhost:3000/products'
            }
        });
        } else{
            res.status(404).json({message: 'No valid entry found for provided ID'});
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });


});

router.patch('/:productId', checkAuth, (req, res, next) => {

    const id = req.params.productId;

    const updateOps = {};
    for (const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }

    Product.updateOne( {_id: id},updateOps)
    .exec()

    .then(result => {
    res.status(200).json({
        message: 'Product updated',
        request: {
            type: 'GET',
            description: 'To get more info about product',
            url: 'http://localhost:3000/products/' + id
        }
    });
    })

    .catch(err => {
        console.log(err);
        res.status(500).json({
        error:err
        });
    });

})

router.delete('/:productId', checkAuth, (req, res, next) =>{

    const id = req.params.productId;
    Product.deleteOne({_id:id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Product deleted',
            request: {
                type: 'POST',
                description: "To create product",
                url: 'http://localhost:3000/products',
                data : {
                    name: 'String',price: 'Number'
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        });
    });

});


module.exports = router;
