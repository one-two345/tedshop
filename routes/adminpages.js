const express = require('express') 
const router =  express.Router()

//pages model
const page = require('../models/pages')

//GET pages index
router.get('/', (req, res) => {
  page.find({}).sort({ sorting: 1 }).exec()
    .then(pages => {
      res.render('admin/pages', { pages: pages });
    })
    .catch(error => {
      // Handle any errors that occur during the query
      console.error('Error fetching pages:', error);
      res.status(500).send('Error fetching pages');
    });
});

router.get('/add-page', (req, res) => {
  
  res.render('admin/add_pages', {
                               title: '',
                               slug: '',
                               content: '',
  });
});

router.post('/add-page', (req, res) => {

  req.checkBody('title', 'Title must have a value').notEmpty();
  req.checkBody('content', 'Content must have a value').notEmpty();
  
  let title = req.body.title.trim();
  
  let slug = req.body.slug.trim(); // Remove leading/trailing whitespace
  if (!slug) {
    // Generate slug from title if slug is empty
    slug = title
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase(); // Convert to lowercase
  }
  let content = req.body.content;


  let errors = req.validationErrors();

  if (errors) {
    console.log('errors');
    res.render('admin/add_pages', {
      errors: errors,
      title: title,
      slug: slug,
      content: content,
    });
  } else {
  
    page.findOne({ slug: slug })
    .then((existingPage) => {
      if (existingPage) {
        req.flash('danger', 'Page slug already exists, choose another');
        res.render('admin/add_pages', {
          title: title,
          slug: slug,
          content: content,
        });
      } else {
        const page_document = new page({
          title: title,
          slug: slug,
          content: content,
          sorting: 100,
          
        });

        page_document.save();
        page.find({}).sort({sorting: 1}).exec()
       .then(function (pages) {
            req.app.locals.pages = pages;
        });
        console.log('Document saved successfully');
        req.flash('success', 'Page added');
        res.redirect('/admin/pages');
       
      }
    })
    .catch((err) => {
      console.error('Error saving document:', err);
      res.status(500).send('Error saving document'); 
      res.redirect('/admin/pages');
    });

  }
  
});


function sortPages(ids, callback) {
  let count = 0;

  for (let i = 0; i < ids.length; i++) {
      let id = ids[i];
      count++;

      (function (count) {
          page.findById(id)
          .then(function (page) {
            page.sorting = count;
            page.save()
            .then(function () {
              ++count;
              if (count >= ids.length) {
                  callback();
              }
          });
        }) ;
      })(count);

  }
}

/*
* POST reorder pages
*/
router.post('/reorder-pages', function (req, res) {
  let ids = req.body['id[]'];

  sortPages(ids, function () {
      page.find({}).sort({sorting: 1}).exec()
      .then(function (pages) {
            req.app.locals.pages = pages;
        });
  });

});


/*
* GET edit page
*/

router.get('/edit-page/:id', function (req, res) {
  page.findById(req.params.id).exec()
    .then((page) => {
      if (!page) {
        // Handle the case where no page with the specified slug was found
        return res.status(404).send('Page not found');
      }

      // Render the 'admin/edit_page' view with page data
      res.render('admin/edit_page', {
        title: page.title,
        slug: page.slug,
        content: page.content,
        id: page._id,
      });
    })
    .catch((err) => {
      // Handle database query errors
      console.error(err);
      res.status(500).send('Error fetching page');
    });
});


/*
* POST edit page
*/
router.post('/edit-page/:id', (req, res) => {
  
  req.checkBody('title', 'Title must have a value').notEmpty();
  req.checkBody('content', 'Content must have a value').notEmpty();

  let title = req.body.title.trim();
  let slug = req.body.slug.trim();
  if (!slug) {
    slug = title.replace(/\s+/g, '-').toLowerCase();
  }
  let content = req.body.content.trim();
  let id = req.params.id.trim();

  let errors = req.validationErrors();

  if (errors) {
    console.log('errors');
    res.render('admin/edit_page', {
      errors: errors,
      title: title,
      slug: slug,
      content: content,
      id: id,
    });
  } else {
    page.findOne({slug: slug, _id: {'$ne': id } })
      .then((existingPage) => {
        if (existingPage) {
          req.flash('danger', 'Page slug already exists, choose another');
          res.render('admin/edit_page', {
            title: title,
            slug: slug,
            content: content,
            id: id,
          });
        } else {
          page.findById(id)
            .then((foundPage) => {
              foundPage.title = title;
              foundPage.slug = slug;
              foundPage.content = content;

              // Save the modified document
              foundPage.save()
              .then(() => {
                page.find({}).sort({sorting: 1}).exec()
                .then(function (pages) {
                req.app.locals.pages = pages;
                });
                console.log('Document saved successfully');
                req.flash('success', 'Page edited');
                res.redirect('/admin/pages/edit-page/' + id);
                return ;
              })
              .catch((err) => {
                console.error('Error saving document:', err);
                res.status(500).send('Error saving document');
                res.redirect('/admin/pages/edit-page/' + id);
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
router.get('/delete-page/:id', function (req, res) {
  page.findByIdAndRemove(req.params.id)
  .then(() => {
    page.find({}).sort({sorting: 1}).exec()
    .then(function (pages) {
            req.app.locals.pages = pages;
    });
    req.flash('success', 'Page deleted!');
    res.redirect('/admin/pages');
  })
  .catch(err => console.log(err));
});



module.exports = router