const express = require('express') 
const router =  express.Router()
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');


//Product model
const Product = require('../models/product')
const Category = require('../models/category')

//GET products index
router.get('/', (req, res) => {
    let count;
    
    Product.count().exec()
    .then(c => {count = c})
    .catch(error => {
      // Handle any errors that occur during the query
      console.error('Error fetching pages:', error);
      res.status(500).send('Error fetching pages');
    });

    Product.find()
    .then(products => {
      res.render('admin/products', {
        products: products,
        count: count,
      });
    })
    .catch(error => {
      // Handle any errors that occur during the query
      console.error('Error fetching pages:', error);
      res.status(500).send('Error fetching pages');
    });

});
// GET add product
router.get('/add-product', (req, res) => {

  Category.find()
  .then(categories => {
    res.render('admin/add_product', {
      title: '',
      desc: '',
      price: '',
      categories: categories,
  })})
  .catch(error => {
    // Handle any errors that occur during the query
    console.error('Error fetching pages:', error);
    res.status(500).send('Error fetching pages');
  });


  
});
// POST add product
router.post('/add-product', (req, res) => {

//  let imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : '';
  let imageFile = req.files && req.files.image ? req.files.image.name : "";


    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    //req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let desc = req.body.desc;
    let price = req.body.price;
    let category = req.body.category;

  let errors = req.validationErrors();

  if (errors) {
    Category.find()
    .then(function (categories) {
        res.render('admin/add_product', {
            errors: errors,
            title: title,
            desc: desc,
            categories: categories,
            price: price
        });
    })
    .catch(error => {
      // Handle any errors that occur during the query
      console.error('Error fetching products:', error);
      res.status(500).send('Error fetching products');
    });
  } else {
  
    Product.findOne({ slug: slug })
    .then((existingPage) => {
      if (existingPage) {
        req.flash('danger', 'Product title already exists, choose another');
        Category.find()
        .then(function (categories) {
            res.render('admin/add_product', {
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        })
        .catch(error => {
          // Handle any errors that occur during the query
          console.error('Error fetching categoris:', error);
          res.status(500).send('Error fetching categoris');
        });
      } else {
        let price2 = parseFloat(price).toFixed(2);

                let product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });


        product.save()
        .then(() => {
          fs.mkdir('public/product_images/' + product._id, { recursive: true }, (err) => {
            if (err) {
              console.error('Error creating directory:', err);
            } else {
              console.log('Directory created successfully');
            }
          });

          fs.mkdir('public/product_images/' + product._id + '/gallery', { recursive: true }, (err) => {
            if (err) {
              console.error('Error creating directory:', err);
            } else {
              console.log('Directory created successfully');
            }
          });

          fs.mkdir('public/product_images/' + product._id + '/gallery/thumbs', { recursive: true }, (err) => {
            if (err) {
              console.error('Error creating directory:', err);
            } else {
              console.log('Directory created successfully');
            }
          });
        
          if (imageFile !== "") {
            let productImage = req.files.image;
            let path = 'public/product_images/' + product._id + '/' + imageFile;
        
            productImage.mv(path, function (err) {
                if (err) {
                    // Handle the error
                    console.error('Error while moving the file:', err);
                    // You can return an error response or take appropriate action here.
                } else {
                    // File moved successfully
                    console.log('File moved successfully.');
                    // You can proceed with other actions here.
                }
            });
        }
        

          req.flash('success', 'Product added!');
          res.redirect('/admin/products');
        })
        .catch((err) => {
          console.error('Error saving document:', err);
          res.status(500).send('Error saving document 2'); 
          res.redirect('/admin/produc,ts');
        });
      }
    })
    .catch(error => {
      // Handle any errors that occur during the query
      console.error('Error fetching pages:', error);
      res.status(500).send('Error fetching pages');
    });

  }
  
});

/*
* GET edit product
*/

router.get('/edit-product/:id', function (req, res) {

  let errors;

  if (req.session.errors)
      errors = req.session.errors;
  req.session.errors = null;
  Category.find()
  .then(categories => {
    Product.findById(req.params.id)
    .then(p => {
      let galleryDir = 'public/product_images/' + p._id + '/gallery';
            let galleryImages = null;

            fs.readdir(galleryDir, function (err, files) {
                if (err) {
                    console.log(err);
                } else {
                    galleryImages = files;
                    res.render('admin/edit_product', {
                        title: p.title,
                        errors: errors,
                        desc: p.desc,
                        categories: categories,
                        category: p.category.replace(/\s+/g, '-').toLowerCase(),
                        price: parseFloat(p.price).toFixed(2),
                        image: p.image,
                        galleryImages: galleryImages,
                        id: p._id
                    });
                
    }})
   
  })
  .catch(error => {
    // Handle any errors that occur during the query
    console.error('Error fetching categories:', error);
    res.status(500).send('Error fetching categories');
  });

});
});

/*
* POST edit product
*/
router.post('/edit-product/:id', (req, res) => {

 // let imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
  let imageFile = req.files && req.files.image ? req.files.image.name : "";


    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    //req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    let title = req.body.title.trim();
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let desc = req.body.desc;
    let price = parseFloat(req.body.price).toFixed(2);
    let category = req.body.category;
    let pimage = req.body.image;
    let id = req.params.id;

  let errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    res.redirect('/admin/products/edit-product/' + id);
  }else {
    Product.findOne({slug: slug, _id: {'$ne': id}})
    .then(p => {
      if (p){
      req.flash('danger', 'Product title already exists, choose another');
      res.redirect('/admin/products/edit-product/' + id);
      } else {
        Product.findById(id)
        .then((p) => {
          p.title = title;
          p.slug = slug;
          p.desc = desc;
          p.price = price;
          p.category = category; 
          if(imageFile != "" ) 
           {p.image = imageFile;}
          
           
          // Save the modified document
          p.save()
          .then(() => {
            if(imageFile !== ""){
              if(pimage !== ""){
                fs.remove('public/product_images/' + id + '/' + pimage, (err) =>{
                  if (err) {
                    console.error(err);
                  }
                });

              }
              productImage = req.files.image;
              path = 'public/product_images/' + id + '/' + imageFile;
              productImage.mv(path, (err) =>{
                  return console.error( err);
              }); 

            }
            console.log('Document saved successfully?');
            req.flash('success', 'Product edited');
            res.redirect('/admin/products/edit-product/' + id);
          
          })
          .catch((err) => {
            console.error('Error saving document:', err);
            res.status(500).send('Error saving document');
            res.redirect('/admin/products/edit-product/' + id);
          });
      
    })
    .catch(err => {
      console.error('Error fetching products:', err);
      res.status(500).send('Error fetching products');
    });
  }
})
}
  
});

//POST product gallery
 
router.post('/product-gallery/:id', function (req, res) {

  var productImage = req.files.file;
  var id = req.params.id;
  var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
  var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

  productImage.mv(path, function (err) {
      if (err)
          console.log(err);

      resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then(function (buf) {
          fs.writeFileSync(thumbsPath, buf);
      });
  });

  res.sendStatus(200);

});


//GET delete image
router.get('/delete-image/:image', function (req, res) {

  var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
  var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

  fs.remove(originalImage, function (err) {
      if (err) {
          console.log(err);
      } else {
          fs.remove(thumbImage, function (err) {
              if (err) {
                  console.log(err);
              } else {
                  req.flash('success', 'Image deleted!');
                  res.redirect('/admin/products/edit-product/' + req.query.id);
              }
          });
      }
  });
});

// GET delete product
router.get('/delete-product/:id', function (req, res) {

  let id = req.params.id;
  let path = 'public/product_images/' + id;

  fs.remove(path, function (err) {
      if (err) {
          console.log(err);
      } else {
          Product.findByIdAndRemove(id)
          .then(function (err) {
            console.log(err);
          }) 

          req.flash('success', 'Product deleted!');
          res.redirect('/admin/products');
      }
  });

});




module.exports = router