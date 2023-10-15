const express = require('express');
const router =  express.Router();


// Get Page model
let page = require('../models/pages');

/*
 * GET /
 */
router.get('/', function (req, res) {
    page.findOne({ slug: 'home' })
      .then(function (page) { // Remove the 'err' parameter here
        if (!page) {
          // Handle the case where no page with the specified slug is found
          return res.status(404).send('Page not found');
        }
  
        res.render('index', {
          title: page.title,
          content: page.content
        });
      })
      .catch(function (err) { // Add a catch block for error handling
        console.error(err);
        res.status(500).send('Internal Server Error');
      });
  });

/*
 * GET a page
 */
router.get('/:slug', function (req, res) {
    var slug = req.params.slug;

    page.findOne({ slug: slug })
        .then(function (page) { // Remove 'err' from the argument
            if (!page) {
                // Page not found, so redirect to the homepage
                return res.redirect('/');
            }
            // Page found, render it
            res.render('index', {
                title: page.title,
                content: page.content
            });
        })
        .catch(function (err) { // Add a catch block for error handling
            console.error(err);
            // Handle the error, e.g., by rendering an error page or returning an error response
            res.status(500).send('Internal Server Error');
        });
});

module.exports = router;