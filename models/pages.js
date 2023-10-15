const mongoose = require('mongoose')

//pages schema
const pages_schema = new mongoose.Schema({
   title: {type: String,
           required: true },

    slug: {type: String, },

    content: {type: String,
              required: true },
 
    sorting: {type: Number,},
  
  });
  
  const page = module.exports = mongoose.model('Page', pages_schema);