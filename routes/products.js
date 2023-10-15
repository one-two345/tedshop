let express = require('express');
let router = express.Router();
let fs = require('fs-extra');
let auth = require('../config/auth');
let isUser = auth.isUser;

// Get Product model
let Product = require('../models/product');

// Get Category model
let Category = require('../models/category');

/*
 * GET all products
 */
router.get('/pro', function (req, res) {

    Product.find()
    .then(function (products) {
        res.render('all_products', {
            title: 'All Products',
            products: products,
        });
    })
    .catch(err => {
        console.error(err);
    });

});


/*
 * GET products by category
 */
router.get('/:category', function (req, res) {

    var categorySlug = req.params.category;

    Category.findOne({slug: categorySlug})
    .then(function (c) {
        Product.find({category: categorySlug})
        .then(function (products) {        
            res.render('cat_products', {
                title: c.title,
                products: products
            });
        })
        .catch(err =>{
            console.error(err);
        });
    })
    .catch(err =>{
        console.error(err);
    });

});

/*
 * GET product details
 */
router.get('/:category/:product', function (req, res) {

    let galleryImages = null;
    let loggedIn = (req.isAuthenticated()) ? true : false;

    Product.findOne({slug: req.params.product})
    .then(function (product) {
        
            var galleryDir = 'public/product_images/' + product._id + '/gallery';

            fs.readdir(galleryDir, function (err, files) {
                if (err) {
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages,
                        loggedIn: loggedIn
                    });
                }
            });
        }
    )
    .catch(err => {
        console.error(err);
    });

}) ;

// Exports
module.exports = router;