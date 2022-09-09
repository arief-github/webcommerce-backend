const mongoose = require('mongoose');

// product model
const productSchema = mongoose.Schema({
	name: String,
	image: String,
	countInStock: {
		type: Number,
		required: true
	} ,
});

exports.Product = mongoose.model('product', productSchema);
