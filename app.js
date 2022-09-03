const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');

require('dotenv/config');

const api = process.env.API_URL;

// Middleware will handle request and response
app.use(express.json());
app.use(morgan('tiny'));

// connect to mongoDB
mongoose.connect(process.env.CONNECTION_STRING)
.then(() => {
	console.log('Database Connection is ready...');
})
.catch((err) => {
	console.log(err);
});

// product model
const productSchema = mongoose.Schema({
	name: String,
	image: String,
	countInStock: {
		type: Number,
		required: true
	} ,
});

const Product = mongoose.model('product', productSchema);

// initial route
app.get(`${api}/products`, async (req, res) => {
	const productList = await Product.find();

	if(!productList) {
		res.status(500).json({success: false})
	}

	res.send(productList);
});

app.post(`${api}/products`, (req, res) => {
	// mengambil req body dari front-end
	const product = new Product({
		name: req.body.name,
		image: req.body.image,
		countInStock: req.body.countInStock
	});

	// kembalikan promise resolve dan reject ke front end sebagai respon
	product.save().then((createdProduct) => {
		res.status(201).json(createdProduct)
	}).catch((err) => {
		res.status(500).json({
			error: err,
			success: false
		})
	})
});

// initial server : start awal respon server running
app.listen(3000, () => {
	console.log(`Server is running : http://localhost:3000`);
});