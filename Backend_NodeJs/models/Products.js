const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema({
   id: {
    type: Number,
    required: true,
    unique: true // each product should have a unique id
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number, // integer
    required: true
  },
  stock: {
    type: Number, // integer
    required: true
  }
});
module.exports = mongoose.model('Products', productSchema);