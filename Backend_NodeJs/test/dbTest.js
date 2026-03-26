const Product = require('../models/Products');

const tryFetchingProducts = async () => {
    try {
        const products = await Product.find();
        console.log('Products fetched successfully:', products);
    } catch (err) {
        console.error('Error fetching products:', err.message);
    }
};

module.exports = tryFetchingProducts;