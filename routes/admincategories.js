const express = require('express') 
const router =  express.Router()

//pages model
const Category = require('../models/category')

//GET catagories index
router.get('/', (req, res) => {

  Category.find({}).exec()
    .then(categories => {
      res.render('admin/categories', {categories: categories });
    })
    .catch(error => {
      // Handle any errors that occur during the query
      console.error('Error fetching pages:', error);
      res.status(500).send('Error fetching pages');
    });

});
//GET add category
router.get('/add-category', (req, res) => {
  
  res.render('admin/add_categories', {
                               title: '',
                               
  });
});
//POST add category
router.post('/add-category', (req, res) => {

  req.checkBody('title', 'Title must have a value').notEmpty();
  
  let title = req.body.title.trim();
  
  let slug = title.trim(); // Remove leading/trailing whitespace
  if (!slug) {
    // Generate slug from title if slug is empty
    slug = title.replace(/\s+/g, '-').toLowerCase(); // Convert to lowercase
  }
  let errors = req.validationErrors();

  if (errors) {
    console.log('errors');
    res.render('admin/add_categories', {
      errors: errors,
      title: title,
  
      
    });
  } else {
  
    Category.findOne({ slug: slug })
    .then((existingCategory) => {
      if (existingCategory) {
        req.flash('danger', 'Category title already exists, choose another');
        res.render('admin/add_categories', {
          title: title,    
        });
      } else {
        const category = new Category({
          title: title,
          slug: slug,
         
        });

        category.save()
        .then(() => {
          Category.find()
         .then(function (categories) { // Remove 'err' from the argument
          req.app.locals.categories = categories;
         })
         .catch(function (err) {
           console.log(err);
         });

          console.log('Document saved successfully');
          req.flash('success', 'Category added');
          res.redirect('/admin/categories');
        })
        .catch(err => {
          console.error(err);
        });
     
        
      }
    })
    .catch((err) => {
      console.error('Error saving document:', err);
      res.status(500).send('Error saving document'); 
      res.redirect('/admin/categories');
    });

  }
  
});



/*
* GET edit category
*/

router.get('/edit-category/:id', function (req, res) {
  Category.findById(req.params.id)
    .then((cat) => {
      if (!cat) {
        // Handle the case where no page with the specified slug was found
        return res.status(404).send('Page not found');
      }

      // Render the 'admin/edit_page' view with page data
      res.render('admin/edit_category', {
        title: cat.title,
        id: cat._id,
      });
    })
    .catch((err) => {
      // Handle database query errors
      console.error(err);
      res.status(500).send('Error fetching page');
    });
});


/*
* POST edit category
*/
router.post('/edit-category/:id', (req, res) => {
  
  req.checkBody('title', 'Title must have a value').notEmpty();

  let title = req.body.title.trim();
  let slug = title.trim();
  if (!slug) {
    slug = title.replace(/\s+/g, '-').toLowerCase();
  }

  let id = req.params.id.trim();

  let errors = req.validationErrors();

  if (errors) {
    console.log('errors');
    res.render('admin/edit_category', {
      errors: errors,
      title: title,
      id: id,
    });
  } else {
    Category.findOne({slug: slug, _id: {'$ne': id } })
      .then((cat) => {
        if (cat) {
          req.flash('danger', 'Category title exists, choose another');
          res.render('admin/edit_category', {
            title: title,
            id: id,
          });
        } else {
          Category.findById(id)
            .then((foundCat) => {
              foundCat.title = title;
              foundCat.slug = slug;
           

              // Save the modified document
              foundCat.save()
              .then(() => {
                Category.find()
                .then(function (categories) { // Remove 'err' from the argument
                    req.app.locals.categories = categories;
                })
                .catch(function (err) {
                    console.log(err);
                });

                console.log('Document saved successfully');
                req.flash('success', 'Category edited');
                res.redirect('/admin/categories/edit-category/' + id);
                return ;
              })
              .catch((err) => {
                console.error('Error saving document:', err);
                res.status(500).send('Error saving document');
                res.redirect('/admin/categories/edit-category/' + id);
              });
            })
            .catch((err) => {
              console.error('Error querying the database:', err);
              res.status(500).send('Error querying the database');
            });          
        }       
  })
  .catch((err) => {
    console.error('Error querying the database:', err);
    res.status(500).send('Error querying the database');
  });
}});


// GET delete page
router.get('/delete-category/:id', function (req, res) {
  Category.findByIdAndRemove(req.params.id)
  .then(() => {
    Category.find()
    .then(function (categories) { // Remove 'err' from the argument
        req.app.locals.categories = categories;
    })
    .catch(function (err) {
        console.log(err);
    });

    req.flash('success', 'Category deleted!');
    res.redirect('/admin/categories');
  })
  .catch(err => console.log(err));
});



module.exports = router