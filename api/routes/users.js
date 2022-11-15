const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//IMPORTING MODEL
const User = require('../models/user');

router.get('/', (req, res, next) => {
    User.find()
    .select('email _id')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            users: docs.map(doc => {
                return {
                    email: doc.email,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products' + doc._id
                    }
                };
            })
        }
        res.status(200).json(response);
    })

    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});

router.post('/signup', (req, res, next) => {

    User.find({email:req.body.email}).exec()
    .then(user => {
        if(user.length>0){
            return res.status(422).json({
                message: 'User exists'
            });
        }else{

            bcrypt.hash(req.body.password,10,(err,hash) =>{
                if(err){
                    return res.status(500).json({
                        error: err
                    });
                } else{
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash,
                        role: req.body.role
                    });
                    user.save()
                    .then(result => {
                        console.log(user);
                        res.status(201).json({
                            message: 'User created'
                        });
                    })
                    .catch(err => {
                        res.status(500).json({     
                            error: err
                        })
                    });
                }
            })

        }
    })

});



router.post('/login',(req, res, next) => {
    User.find({email:req.body.email})
    .exec()
    .then(user => {
        if(user.length<1){
            return res.status(404).json({
                message: 'Auth failed '
            });
        } 
        bcrypt.compare(req.body.password,user[0].password, 
            (err, result) => {
                if(err) {
                    return res.status(401).json({
                        message: "Auth failed"
                    });
                }
                if(result) {
                    const token = jwt.sign({
                        email:user[0].email,
                        userId: user[0]._id,
                        roleNum: user[0].role
                    },process.env.JWT_KEY,
                    
                    {
                        expiresIn: "1h"
                    });

                    res.status(200).json({
                        message:"Auth successful",
                        token:token
                    });
                }
                return res.status(401).json({
                    message: "Auth failed"
                });
            })
            
        
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        });
    });

})



router.delete('/:userId', (req, res, next) => {
    User.deleteOne({_id:req.params.userId}).exec()
    .then(result => {
        res.status(200).json({
            message: "User Deleted"
        });
    })
    .catch(err => {
        res.status(500).json({
            error:err
        });
    });
});

router.delete('/', (req, res, next) => {
    User.deleteMany().exec()
    .then(result => {
        res.status(200).json({
            message: "Users Deleted"
        });
    })
    .catch(err => {
        res.status(500).json({
            error:err
        });
    });
});




module.exports = router;