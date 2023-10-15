const express = require('express')
const path = require('path')
const cors = require('cors')
const mongoose  = require('mongoose')
const config = require("./config/database")
const bodyParser = require('body-parser')
const session = require('express-session')
const expressValidator = require('express-validator')
const fileUpload = require('express-fileupload')
const passport = require('passport')
const database = require('./config/database')

const app =  express();
const port = 4000;

// Add this line at the beginning of your script

app.use(bodyParser.urlencoded({ extended: true }));
async function main() {
  try {
    await mongoose.connect(database.database, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

main();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

//set global error variables
app.locals.errors = null;

// Get Page Model
let page = require('./models/pages');

// Get all pages to pass to header.ejs
page.find({}).sort({sorting: 1}).exec()
.then(function (pages) { // Remove 'err' from the argument
    app.locals.pages = pages;
})
.catch(function (err) {
    console.log(err);
});

//get Category model
let Category = require('./models/category');
// Get all categories to pass to header.ejs
Category.find()
.then(function (categories) { // Remove 'err' from the argument
    app.locals.categories = categories;
})
.catch(function (err) {
    console.log(err);
});


//middlewares

// Express fileUpload middleware
app.use(fileUpload());

//body-parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//express-session middleware
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
 // cookie: { secure: true }
}))

// Express Validator middleware
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
      var namespace = param.split('.')
              , root = namespace.shift()
              , formParam = root;

      while (namespace.length) {
          formParam += '[' + namespace.shift() + ']';
      }
      return {
          param: formParam,
          msg: msg,
          value: value
      };
  },
  customValidators: {
      isImage: function (value, filename) {
          var extension = (path.extname(filename)).toLowerCase();
          switch (extension) {
              case '.jpg':
                  return '.jpg';
              case '.jpeg':
                  return '.jpeg';
              case '.png':
                  return '.png';
              case '':
                  return '.jpg';
              default:
                  return false;
          }
      }
  }
}));

// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
});

// Set routes
const pages = require('./routes/pages');
const products = require('./routes/products');
const cart = require('./routes/cart');
const users = require('./routes/users');
const admin_pages = require('./routes/adminpages');
const admin_categories = require('./routes/admincategories');
const admin_products = require('./routes/adminproducts');

app.use('/', pages);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/admin/pages', admin_pages);
app.use('/admin/categories', admin_categories);
app.use('/admin/products', admin_products);

app.listen(port, ()=>{console.log('server started on: ' + port)});