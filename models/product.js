const mongoose = require('mongoose')

//pages schema
const products_schema = new mongoose.Schema({

    title: {type: String,
           required: true },

    slug: {type: String, },

    desc: {type: String,
           required: true},
    
    price: {type: Number,
            required: true},

    category: {type: String,
               required: true},

    rating: {type: Number,},

    image : {type: String},
   
  });
  
  const Product = module.exports = mongoose.model('Product', products_schema);