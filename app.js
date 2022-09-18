const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const authJwt = require('./helpers/jwt');
const cors = require('cors');
require('dotenv/config');

// enabling cors
app.use(cors());
app.options("*", cors());

const api = process.env.API_URL;

// Middleware will handle request and response
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());

// connect to mongoDB
mongoose.connect(process.env.CONNECTION_STRING)
.then(() => {
	console.log('Database Connection is ready...');
})
.catch((err) => {
	console.log(err);
});

// initial route
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);

// initial server : start awal respon server running
app.listen(3000, () => {
	console.log(`Server is running : http://localhost:3000`);
});