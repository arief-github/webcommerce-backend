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
})
// initial route
app.get(`${api}/products`, (req, res) => {
	const product = {
		id: 1,
		name: 'Laptop Macbook',
		image: 'some_url', 
	}
	res.send(product);
});

app.post(`${api}/products`, (req, res) => {
	const newProduct = req.body;
	res.send(newProduct);
});

// initial server : start awal respon server running
app.listen(3000, () => {
	console.log(`Server is running : http://localhost:3000`);
});